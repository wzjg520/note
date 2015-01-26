/**
 * 如何快速构建 Widget
 * 
 * iu.widget(name, parent, options)
 *
 * options reserved keywords -- _super,_child
 * 
 * @example iu.dialog(selector, options)
 * */
;(function() {
	var iu = function(name) {
		if (widgets[name]) {
			var args = makeArray(arguments); args.shift();
			return iu[name].apply(iu, args);
		}

		return new Widget();
	};

	iu.version = '0.0.1b';

	/**
	 * avoid iu override
	 * */
	if (window.iu && window.iu.version == iu.version) {
		return;
	}

	window.iu = iu;

	/**
	 * widget factory
	 * 
	 * @param name string
	 * @param parent string parent widget name, to extend
	 * @param options object widget config
	 * */
	iu.widget = function(name, parent, options) {
		new Widget(name, parent, options);
		return iu[name];
	};

	/**
	 * output iu widgets
	 * */
	iu.toString = function() {
		var name, list = [];
		for (name in widgets) {
			list.push('iu.' + name);
		}
		return list.join('\n');
	};

	/**
	 * iu.tool namespace
	 * 
	 * @example iu.tool.type, iu.tool.has, iu.tool.index ...
	 * */
	iu.tool = {};

	/**
	 * Widget base class
	 * */
	function Widget(name, parent, members) {
		if (!name || !type(name, 'string')) {
			return;
		}

		/**
		 * widget instance creater, multi-parameter supported
		 * 
		 * @param selector css selector,dom element,jQuery Object
		 * @param options object, creater config
		 * @param arg...
		 * 
		 * @return return the last widget of the specified selector
		 * */
		function Creater(/* selector, options */) {
			var widget;

			var args = makeArray(arguments),
				selector = args.shift(),
				arg0 = args[0],
				length = args.length,
				get, ret;

			$(selector).each(function() {
				var me = $(this), options, command, key, unknown;

				widget = instances.get(me, name);

				if (widget) {
					if (length) {
						if (type(arg0, 'object')) {
							// setOption
							widget.setOption(arg0);
						} else if (type(widget[arg0], 'function')) {
							// command
							command = arg0;
							args.shift();
						} else if (own(widget.options, arg0)) {
							// get option
							if (length == 1) {
								get = 1;
								ret = widget.options[arg0];
								return false;
							}

							// setOption, multi-parameter
							widget.options[arg0] = args[1];
							widget.setOption.apply(widget, args);

						} else if (arg0 in widget) {
							// get widget member
							get = 1;
							ret = widget[arg0];
							return false;
						} else {
							// set unknown option, it is useful for some widget; multi-parameter
							widget.setOption.apply(widget, args);
						}
					}
				} else {
					widget = new constructor(me);
					options = widget.options;

					if (length) {
						if (type(widget[arg0], 'function')) {
							// new widget(function, arguments)
							if (arg0 == 'destroy') {
								return widget = undefined;
							}

							command = arg0;
							args.shift();

						} else if (arg0 in options) {
							// new widget(key, value)
							options[arg0] = args[1];
						} else if (type(arg0, 'object')) {
							// new widget(object)
							// extend is out of controll, if the options contains some dom element
							cover(options, arg0);
						} else {
							// new widget(string|number|boolean...) // for variable call
							unknown = true;
						}
					}

					instances.put(me, name, widget);

					if (false === (unknown ? 
										widget.init.apply(widget, args)
											: widget.init())) {

						instances.remove(me, name);

						return widget = undefined;
					}

					if (type(options.init, 'function')) {
						try {
							options.init.call(me);
						} catch (e) {
							widget.destroy();

							return widget = undefined;
						}
					}
				}

				if (command) {
					if (command != 'init') {
						get = command != 'destroy';
						ret = widget[command].apply(widget, args);
					}
				}
			});

			if (get) {
				return ret;
			}

			return widget;
		};

		/**
		 * widget instance prototype
		 * extended from Widget
		 * */
		var prototype = extend({}, this, true), _super;

		/**
		 * widget instance constructor
		 * 
		 * @param element dom|wrapped dom, which is a jQuery Object in iu. used in widget function
		 * */
		function constructor(element) {
			var self = this;

			self._super = extend({}, self._super);
			self._super._child = self;
			self.element = element;
			self.options = extend({}, self.options);

			// copy events callback
			if (type(self.events, 'object')) {
				var key, events = {};

				for (key in self.events) if (own(self.events, key)) {
					events[key] = (function(callback) {
						return function(e) {
							return callback.call(self, e, this);
						}
					})(self.events[key]);
				}

				self.events = events;
			}
		}

		if (type(parent, 'string')) {
			parent = widgets[parent];

			if (parent) {
				prototype._super = _super = extend({}, parent);

				for (var func in _super) if (type(_super[func], 'function')) {
					_super[func] = (function(base) {
						return function() {
							base.apply(this._child, arguments);
						};
					})(_super[func]);
				}

				_super = null;
			} else {
				return false;
			}
		}

		prototype = extend(prototype, parent, members);
		prototype.name = name;
		prototype.constructor = constructor;
		prototype.destroy = (function(destroy) {
			return function() {
				var self = this, options = self.options, ret;

				if (type(options.desctroy, 'function')) {
					options.destroy.call(self.element);
				}

				ret = destroy.apply(self, arguments);

				if (false === ret) {
					return false;
				}

				self.clear();
				instances.remove(self.element, name);

				return ret;
			};
		})(prototype.destroy);
		prototype.setOption = (function(setOption) {
			return function() {
				var self = this, options = self.options, key, args = arguments, arg0 = args[0];

				if (!type(arg0, 'object|array')) {
					if (args.length > 1 && own(options, arg0)) {
						options[arg0] = args[1];
					}

					return setOption.apply(self, args);
				}

				for (key in arg0) {
					if (own(arg0, key) && own(options, key)) {
						options[key] = arg0[key];
						setOption.call(self, key, arg0[key]);
					}
				}
			};
		})(prototype.setOption);

		widgets[name] = constructor.prototype = prototype;

		Creater.options = extend({}, prototype.options);
		Creater.setOption = function(key, value) {
			if (type(key, 'string')) {
				Creater.options[key] = prototype.options[key] = value;
				return;
			}

			for (var j in key) if (own(key, j)) {
				Creater.options[j] = prototype.options[j] = key[j];
			}
		};

		var old = iu[name] || Widget;

		// conflict
		Creater.noConflict = function() {
			return old;
		};

		// output usage
		Creater.toString = function() {
			var options = this.options, key, value, list = [];
			list.push('iu.' + name + '(selector, {');
			for (key in options) if (own(options, key)) {
				value = options[key];
				value = type(value, 'string') ? '"' + value + '"'
						: type(value, 'array') ? '[' + value.join(',') + ']'
						: type(value, 'object') ? JSON.stringify(value)
						: type(value, 'function') ? 'function() {}' : value;
				list.push('\t' + key + ' : ' + value + ',');
			}
			value = list.length - 1;
			value > 0 ? list[value] = list[value].slice(0, -1) : 0;
			list.push('});');
			return list.join('\n');
		};

		// add to iu namespace
		iu[name] = Creater;
	}

	/**
	 * Widget prototype
	 * 
	 * init : widget instance constructor
	 * desctroy : widget instance desctructor
	 * element : dom element, wrapped jQuery object
	 * timer : record the detention
	 * delay : delay a callback, clear the precious detention
	 * clear : clear delay
	 * setOption : used to change the options after the widget instance created
	 * options : widget instance constructor used
	 * */
	Widget.prototype = {
		init : noop, // called once, widget.init(...), the next operations will be prevented if false returned
		destroy : noop, // called once, widget.destroy(...)
		// element : null, // jQuery/Zepto object
		// timer : null, // setTimeout
		setOption : noop, // multi-parameter supported
		// options, : null // object default options
		// events : null, // object events callback
		delay : function(handler, args, duration) {
			var self = this, proxy = function() {
				return handler.apply(self, args);
			};

			type(handler, 'string') ? handler = self[handler] : 0;
			type(handler, 'function') ? 0 : handler = noop;

			if (type(args, 'number')) {
				duration = args;
				args = [];
			} else if (!type(args, 'array')) {
				args = [];
			}

			clearTimeout(self.timer);
			self.timer = setTimeout(proxy, duration);
		},
		clear : function() {
			clearTimeout(this.timer);
		}
	};
	/* Widget end */

	var widgets = {};

	var instances = {
		wid : 1,

		get : function(element, name) {
			return instances[element.data('iu_' + name + '_wid')];
		},

		put : function(element, name, widget) {
			var wid = 'iu_' + name + '_' + instances.wid++;

			instances[wid] = widget;
			element.data('iu_' + name + '_wid', wid);

			return wid;
		},

		remove : function(element, name) {
			delete instances[element.data('iu_' + name + '_wid')];
		}
	};

	/* const and util start */
	var core_slice = [].slice,
		core_toString = {}.toString,
		core_has = {}.hasOwnProperty,
		doc = document,
		win = window;

	var $ = win.jQuery || window.Zepto;

	function noop() {}

	function own(obj, prop) {
		return obj ? core_has.call(obj, prop) : false;
	}

	function makeArray(fake) {
		try {
			return core_slice.call(fake);
		} catch (e) {
			var arr = [], i;

			for (i in fake) {
				core_has.call(fake, i) && arr.push(fake[i]);
			}

			return arr;
		}
	}

	function type(a, type) {
		var t = typeof a;

		if (t.charAt(0) == 'o') {
			if (null === a) {
				t = 'null';
			} else {
				t = a.nodeName || core_toString.call(a).slice(8, -1);
				t = t.toLowerCase();
			}
		}

		if (type) {
			if (type.indexOf('|')) {
				type = type.split('|');

				for (var i = 0, length = type.length; i < length; i++) {
					if (t == type[i]) {
						return true;
					}
				}

				return false;
			}

			return t == type;
		}

		return t;
	}

	/**
	 * extend to from source...
	 * 
	 * @param proto boolean contain proto
	 * */
	function extend(to/*, source, source..., proto*/) {
		var args = arguments, i, length = args.length, key, source, has = args[length - 1] == true;

		if (has) {
			length--;
			has = function() {
				return true;
			};
		} else {
			has = own;
		}

		for (i = 1; i < length; i++) {
			source = args[i];

			for (key in source) if (has(source, key)) {
				if (type(source[key], 'object')) {
					if (type(to[key], 'object')) {
						extend(to[key], source[key]);
					} else {
						to[key] = extend({}, source[key]);
					}
				} else {
					to[key] = source[key];
				}
			}
		}

		return to;
	}

	/**
	 * cover the same key
	 * 
	 * @param proto boolean contain proto
	 * */
	function cover(to, source, proto) {
		var has, key;

		if (proto) {
			has = function() {
				return true;
			}
		} else {
			has = own;
		}

		for (key in source) if (has(source, key)) {
			to[key] = source[key];
		}
	}

	function each(arr, callback) { if (arr && type(callback, 'function')) {
		var i, length;

		if (arr.length == null) {
			for (i in arr) if (own(arr, i)) {
				if (false === callback.call(arr[i], arr[i], i)) {
					return;
				}
			}

			return;
		}

		for (i = 0, length = arr.length; i < length; i++) {
			if (false === callback.call(arr[i], arr[i], i)) {
				return;
			}
		}
	}};

	function map(arr, callback) { if (arr && type(callback, 'function')) {
		var i, length;

		if (arr.length == null) {
			for (i in arr) if (own(arr, i)) {
				arr[i] = callback.call(arr[i], arr[i], i);
			}

			return;
		}

		for (i = 0, length = arr.length; i < length; i++) {
			arr[i] = callback.call(arr[i], arr[i], i);
		}
	}};

	var tool = iu.tool;

	tool.key = {ESC : 27, TAB : 9, CAPS : 20, SHIFT : 16, CTRL : 17, ALT : 18, SPACE : 32, BACK : 8, ENTER : 13, INSERT : 45, DEL : 46, HOME : 36, END : 35, PAGE_DOWN : 34, PAGE_UP : 33, COMMA : 188, NUM_ADD : 107, NUM_DECIMAL : 110, NUM_DIVIDE : 111, NUM_ENTER : 108, NUM_MULTIPLY : 106, NUM_SUBTRACT : 109, LEFT : 37, UP : 38, RIGHT : 39, DOWN : 40};

	tool.extend = extend;
	tool.noop 	= noop;
	tool.own 	= own;
	tool.type 	= type;
	tool.each 	= each;
	tool.map 	= map;

	/**
	 * event support
	 *
	 * input, uninput
	 * mousewheel, unmousewheel
	 *
	 * */
	var head = doc.head || doc.getElementsByTagName('head')[0];

	var input_event_tag = 'input',
		mousewheel_event_tag = 'mousewheel';

	if (head.oninput === undefined) {
		// ie < 9
		input_event_tag = 'propertychange keyup';
	} else if (head.onpropertychange !== undefined) {
		// ie >= 9
		input_event_tag = 'input keyup';
	}

	tool.input = function(element, data, callback) {
		$(element).bind(input_event_tag, data, callback);
	};

	tool.uninput = function(element, callback) {
		$(element).unbind(input_event_tag, callback);
	};

	if (head.onmousewheel === undefined) {
		// firefox
		mousewheel_event_tag = 'DOMMouseScroll';
	}

	tool.mousewheel = function(element, data, callback) {
		$(element).bind(mousewheel_event_tag, data, callback);
	};

	tool.unmousewheel = function(element, callback) {
		$(element).unbind(mousewheel_event_tag, callback);
	};

	/**
	 * 获取事件触发时鼠标位置
	 * */
	tool.getMouse = function(e) {
		var getMouse,
			db = doc.body,
			dd = doc.documentElement;

		var pisition = {
			win : function(e) {
				return {
					x : e.clientX + pageXOffset,
					y : e.clientY + pageYOffset
				}
			},
			db : function(e) {
				return {
					x : e.clientX + db.scrollLeft,
					y : e.clientY + db.scrollTop
				}
			},
			dd : function(e) {
				return {
					x : e.clientX + dd.scrollLeft,
					y : e.clientY + dd.scrollTop
				}
			},
			touch : function(e) {
				e = e.originalEvent || e; // because of jQuery return a wraped object of the event
				e = e.changedTouches[0];

				return {
					x : e.pageX,
					y : e.pageY
				}
			}
		};

		if (iu.support.touch) {
			getMouse = pisition.touch;
		} else if (typeof pageXOffset == 'number') {
			getMouse = pisition.win;
		} else if (typeof doc.compatMode != 'undefined' && doc.compatMode != 'BackCompat') {
			getMouse = pisition.dd;
		} else {
			getMouse = pisition.db;
		}

		return (tool.getMouse = getMouse)(e);
	};

	/**
	 * 返回事件元素距离当前页面可见区域左上角的偏移
	 * */
	tool.getViewOffset = function(evt/*, ignoreEventOffset*/) {
		var offset, event_offset, db, dd, width, height;

		db = doc.body;
		dd = doc.documentElement;
		width = dd.clientWidth || db.clientWidth || 0;
		height = dd.clientHeight || db.clientHeight || 0;

		if (undefined == evt.pageX) {
			offset = {
				left : evt.clientX,
				top : evt.clientY
			};
		} else {
			offset = {
				left : evt.pageX - (dd.scrollLeft || db.scrollLeft),
				top : evt.pageY - (dd.scrollTop || db.scrollTop)
			};
		}

		offset.right = width - offset.left;
		offset.bottom = height - offset.top;

		var ignoreEventOffset = false;
		if (ignoreEventOffset) {
			if (event_offset = tool.getEventOffset(evt)) {
				offset.x -= event_offset.x;
				offset.y -= event_offset.y;
			}
		}

		return offset;
	};

	/**
	 * 获取事件对于 target 的偏移, 兼容 Firefox, Firefox 没有提供 offsetX
	 * */
	tool.getEventOffset = function(e) {
		if (iu.support.touch) {
			tool.getEventOffset = function(e) {
				e = e.originalEvent || e;

				if (e.layerX > 0 ) {
					return {
						x : e.layerX,
						y : e.layerY
					}
				}

				var touch = e.touches.item(0),
					offset = $(e.target).offset();

				return {
					x : touch.pageX - offset.left,
					y : touch.pageY - offset.top
				}
			};
		} else {
			tool.getEventOffset = function(e) {
				if (e) {
					if (e.offsetX == null) {
						// firefox
						return getOffset(e);
					} else {
						return {
							x : e.offsetX,
							y : e.offsetY
						}
					}
				}
			};
		}

		return tool.getEventOffset(e);
	};

	// firefox
	function getOffset(evt) {
		var target = evt.target, pageCoord, eventCoord, offset;
		target.offsetLeft == undefined ? target = target.parentNode : 0;

		pageCoord = getPageCoord(target);
		eventCoord = {
			x: win.pageXOffset + evt.clientX,
			y: win.pageYOffset + evt.clientY
		};

		return {
			x: eventCoord.x - pageCoord.x,
			y: eventCoord.y - pageCoord.y
		}
	}

	function getPageCoord(element) {
		var coord = {x : 0, y : 0};

		while (element){
			coord.x += element.offsetLeft;
			coord.y += element.offsetTop;
			element = element.offsetParent;
		}

		return coord;
	}

	/**
	 * 取消事件默认操作, 阻止冒泡
	 * */
	tool.cancelEvent = function(e) {
		e = e ? (e.originalEvent || e) : window.event;

		if (e) {
			if (e.preventDefault) {
				e.preventDefault();
				e.stopPropagation();
			} else {
				e.cancelBubble = true;
				e.returnValue = false;
			}

			e.preventManipulation && e.preventManipulation(); // IE 10
		}

		return false;
	};
	/* event support end */

	tool.animateShow = function(element, animate, callback, duration) {
		if (!type(callback, 'function')) {
			duration = callback;
			callback = noop;
		}

		duration = duration > 0 ? parseFloat(duration) || 0 : 500;

		if (animate == 'fade') {
			element.stop(false, true).fadeIn(duration, callback);
		} else if (animate == 'slide') {
			var height = element.height(), style, precious;

			if (height == 0) {
				style = element.get(0).style;
				precious = style.height;
				style.height = '';
			}

			element.stop(false, true).slideDown(duration, function() {
				if (height == 0) {
					style.height = precious;
				}

				callback.apply(this, arguments);
			});
		} else {
			element.show();
			callback();
		}
	};
	tool.animateHide = function(element, animate, callback, duration) {
		if (!type(callback, 'function')) {
			duration = callback;
			callback = noop;
		}

		duration = duration > 0 ? parseFloat(duration) || 0 : 500;

		if (animate == 'fade') {
			element.stop(false, true).fadeOut(duration, callback);
		} else if (animate == 'slide') {
			var height = element.height(), style, precious;

			if (height == 0) {
				style = element.get(0).style;
				precious = style.height;
				style.height = '';
			}

			element.stop(false, true).slideUp(duration, function() {
				if (height == 0) {
					style.height = precious;
				}

				callback.apply(this, arguments);
			});
		} else {
			element.hide();
			callback();
		}
	};
	tool.buildText = function(option) {
		var text 	= option.text,
			langid 	= option.langid,
			css 	= option.css;

		null == text ? text = langid ? tool.getText(langid) || '' : '' : 0;
		langid = null == langid ? '' : langid = ' langid="' + langid + '"';
		css = null == css ? '' : ' ' + css;

		return {
			text : text,
			langid : langid,
			css : css
		}
	};
	tool.getText = win.isapp ? isapp.getLangText : function(langid) {
		return langid;
	};
	tool.escapeHTML = function(s) {
		return s == null ? '' : (s + '').replace(/&/g, '&amp;').replace(/ /g, '&nbsp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	};
	tool.descapseHTML = function(s) {
		return s == null ? '' : (s + '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
	};
	// #todo to comment
	tool.holdWidget = function(e, element, widget) {
		var hold, target;

		element = element[0];
		widget = widget[0];
		target = $(e.target);

		target.add(target.parents()).each(function(i, tag) {
			if (tag == element) {
				hold = 1;
				return false;
			}

			if (tag == widget) {
				hold = 2;
				return false;
			}
		});

		return hold;
	},
	tool.fail = function() {
		return false;
	};
	tool.none = function(tag) {
		return tag.css('display') == 'none';
	};
	tool.css = function(element, options, list) {
		if (type(list, 'string')) {
			list = list.split(',');
		}

		for (var i = 0, length = list.length; i < length; i++) {
			options[list[i]] == null || element.css(list[i], options[list[i]]);
		}
	};
	tool.position = function(element) {
		element.each(function(i, tag) {
			$(tag).css('position') == 'static' && $(tag).css('position', 'relative');
		});
	};
	tool.reverseColor = function(color) {
		var i = 0;

		if (/^rgb/.test(color)) {
			return color.replace(/\d+/g, function(num) {
				if (i++ == 3) {
					return 1 - num;
				}

				return 255 - num;
			});
		}

		return color.replace(/[0-9a-f]/ig, function(letter) {
			return (16 - parseInt('0x' + letter)).toString(16);
		});
	};

	tool.index = function(arr, item, last) {
		return null == arr ? -1 : last ? lastIndexOf(arr, item) : indexOf(arr, item);
	};

	function indexOf(arr, item) {
		if (arr.indexOf) {
			return arr.indexOf(item);
		}

		for (var i = 0, length = arr.length; i < length; i++) {
			if (arr[i] === item) {
				return i;
			}
		}

		return -1;
	}

	function lastIndexOf(arr, item) {
		if (arr.lastIndexOf) {
			return arr.lastIndexOf(item);
		}

		for (var i = arr.length - 1; i > -1; i--) {
			if (arr[i] === item) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * return scroll bar width
	 * */
	tool.scrollBarWidth = function(tag) {
		if (!tag.length || tag.css('scroll') == 'hidden') {
			return 0;
		}

		var overflow = tag.get(0).style.overflowY,
			width = tag.outerWidth(true) - tag.css('overflow-y', 'hidden').outerWidth(true);

		tag.css('overflow-y', overflow);

		return -width;
	};
	tool.scrollParent = function(child) {
		var parent = child;

		while (true) {
			parent = parent.parent();
			tag = parent.get(0);

			if (!tag || !tag.nodeName || /^body$|^head$|^html$/i.test(tag.nodeName)) {
				break;
			}

			if (tag.scrollHeight > tag.clientHeight) {
				break;
			}
		}

		return parent;
	};
	tool.bodyScrollTop = function() {
		return win.pageYOffset || doc.documentElement.scrollTop || doc.body.scrollTop;
	};
	tool.bodyScrollLeft = function() {
		return win.pageXOffset || doc.documentElement.scrollLeft || doc.body.scrollLeft;
	};
	tool.windowHeight = function() {
		return win.innerHeight || doc.documentElement.clientHeight || doc.body.clientHeight;
	};
	tool.windowWidth = function() {
		return win.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth;
	};

	/**
	 * iu.support namespace
	 * 
	 * @example iu.support.transform
	 * */
	iu.support = {
		input : head.oninput !== undefined,
		keepblank : (function() {
			var a = document.createElement('a'), remove;
			a.innerHTML = ' ';
			head.appendChild(a);
			remove = '' != a.innerHTML;
			head.removeChild(a);
			return remove;
		})(),
		propertychange : head.onpropertychange !== undefined,
		touch : !!document.createTouch,
		transform : (function() {
			var style = head.style, transform = '';

			each(['webkitTransform', 'msTransform', 'oTransform', 'mozTransform', 'transform', 'filter'], function(name) {
				if (style[name] !== undefined) {
					transform = name;
					return false;
				}
			});

			return transform;
		})()
	};
})();