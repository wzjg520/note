/**
 * iu.autocomplete.js
 * */
iu.widget('autocomplete', {
	init : function(source) {
		if (source) {
			this.options.source = source;
		}

		this._createAutoComplete();
	},
	destroy : function () {
		var self = this;

		self.hide();
		iu.tool.uninput(self.element, self.events.input);
	},
	autocomplete : null,
	filter : function(html) {
		return html.replace(/<\/?\w.*?>/g, '');
	},
	getDataList : function(val) {
		var source = this.options.source, html = [], i, length;

		if (iu.tool.type(source, 'array')) {
			val = (val + '').replace(/^\s+|\s+$/g, '');

			if (!val) {
				return html;
			}

			for (i = 0, length = source.length; i < length; i++) {
				if (source[i].indexOf(val) > -1) {
					html.push(source[i].replace(val, '<span class="iu_autocomplete_li_hightlight">' + val + '</span>'));
				}
			}
		}

		return html;
	},
	updateList : function(source) {
		if (source === false) {
			return;
		}

		var self = this,
			html,
			i,
			length = Math.min(source.length, self.options.max);

		if (length) {
			html = '<li class="iu_autocomplete_li_selected">' + source[0] + '</li>';

			for (i = 1; i < length; i++) {
				html += '<li>' + source[i] + '</li>';
			}

			self.autocomplete.html(html);
			self.show();
		} else {
			self.hide();
		}
	},
	show : function() {
		if (!iu.tool.none(this.autocomplete)) {
			return;
		}

		var self = this,
			events = self.events;

		self.calcPosition();
		self.autocomplete.show();

		self.element
			.bind('blur', events.blur)
			.bind('keydown', events.keydown);

		$(window).bind('resize', events.resize);
		iu.tool.mousewheel(document.body, events.mousewheel);
	},
	hide : function() {
		var self = this, events = self.events;
		
		self.autocomplete.hide().html('');

		self.element
			.unbind('blur', events.blur)
			.unbind('keydown', events.keydown);

		$(window).unbind('resize', events.resize);
		iu.tool.unmousewheel(document.body, events.mousewheel);
	},
	focus : function(prev) {
		var lis = this.autocomplete.children(), index;

		index = lis.filter('.iu_autocomplete_li_selected').removeClass('iu_autocomplete_li_selected').index();
		prev ? index-- : index++;
		index < lis.length ? index < 0 ? index += lis.length : 0 : index -= lis.length;

		lis.eq(index).addClass('iu_autocomplete_li_selected');
	},
	fill : iu.support.input ? function(item) {
		var self = this, val, focus, item_html;

		item ? focus = true : item = self.autocomplete.children('.iu_autocomplete_li_selected');

		if (!item.length) {
			return;
		}
		
		item_html = item.html();
		val = self.filter(item_html);
		self.element.val(val);
		self.hide();

		if (iu.tool.type(self.options.change, 'function')) {
			self.options.change.call(self.element, val, item_html);
		}
	} : function(item) {
		var self = this, val, focus, item_html;

		item ? focus = true : item = self.autocomplete.children('.iu_autocomplete_li_selected');

		if (!item.length) {
			return;
		}

		// ie8 下设置 value 再次触发 propertychange 事件
		iu.tool.uninput(self.element, self.events.input);
		setTimeout(function() {
			iu.tool.input(self.element, self.events.input);
		}, 1);

		item_html = item.html();
		val = self.filter(item_html);
		self.element.val(val);
		self.hide();

		if (iu.tool.type(self.options.change, 'function')) {
			self.options.change.call(self.element, val, item_html);
		}
	},
	calcPosition : function() {
		var self = this,
			element = self.element,
			options = self.options,
			css = element.position();

		css.top += element.outerHeight() + (parseFloat(element.css('margin-top')) || 0);
		css.left += parseFloat(element.css('margin-left')) || 0;
		options.top ? css.top += parseFloat(options.top) || 0 : 0;
		options.left ? css.left += parseFloat(options.left) || 0 : 0;

		self.autocomplete.css(css);
	},
	_createAutoComplete : function() {
		var self = this,
			element = self.element,
			events = self.events,
			options = self.options;

		if (options.width == 'auto') {
			options.width = element.outerWidth();
		}

		self.autocomplete = $('<ul class="iu_autocomplete"></ul>').appendTo(element.offsetParent());
		iu.tool.css(self.autocomplete, options, 'width,height,zIndex');

		self.autocomplete
			.bind('mouseover', events.mouseover)
			.bind('mousedown', events.mousedown)
			.bind('contextmenu', events.contextmenu);

		iu.tool.input(element, events.input);
	},
	events : {
		input : function(e) {
			var self = this,
				element = self.element,
				options = self.options,
				val = element.val();

			// ie8,9,10 iu.tool.input bug
			if (e.type == 'propertychange') {
				if (e.originalEvent.propertyName != 'value') {
					return;
				}
			} else if (e.type == 'keyup') {
				if (e.which != iu.tool.key.BACK) {
					return;
				}
			}

			self.updateList(options.getList ? options.getList(val) : self.getDataList(val));
		},
		keydown : function(e) {
			var self = this, key = iu.tool.key;

			switch (e.which) {
				case key.UP : {
					self.focus(true);
					break;
				}
				case key.DOWN : {
					self.focus();
					break;
				}
				case key.TAB :
				case key.ENTER : {
					e.altKey || e.ctrlKey || e.shiftKey || self.fill();
				}
				default : return;
			}

			return false;
		},
		blur : function(e) {
			this.options.persist || this.hide();
		},
		mousedown : function(e) {
			if (e.which != 1) {
				return false;
			}

			var li = $(e.target).parentsUntil('ul.iu_autocomplete');

			li.length ? 0 : li = $(e.target);

			if (/^li$/i.test(li[0].nodeName)) {
				this.fill(li);
			}

			return false;
		},
		mouseover : function(e) {
			var me = e.target;

			if (/^li$/i.test(me.nodeName)) {
				$(me).addClass('iu_autocomplete_li_selected').siblings('.iu_autocomplete_li_selected').removeClass('iu_autocomplete_li_selected');
			}
		},
		mousewheel : function(e) {
			this.focus((e.originalEvent.wheelDelta || -e.originalEvent.detail) > 0);
			return e.target != this.element.get(0);
		},
		resize : function(e) {
			this.calcPosition();
		},
		contextmenu : function(e) {
			return this.options.inspectable;
		}
	},
	options : {
		source : null, // array autocomplete data source
		max : 11,
		persist : false, // persist show when the input blurs
		inspectable : true,
		getList : null, // function(val) {} // return an array to write into the autocomplete
		change : null, // callback after fill the input
		width : 'auto', // auto detect the input's width
		height : null,
		zIndex : null,
		top : 0,
		left : 0
	}
});