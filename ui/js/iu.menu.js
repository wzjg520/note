/**
 * iu.menu.js
 * 联动菜单请单独实现
 * */
iu.widget('menu', {
	init : function(menu) {
		var self = this,
			options = self.options;

		if (menu) {
			options.menu = menu;
		}

		self._createMenu();
	},
	destroy : function() {
		var self = this,
			menu = self.menu,
			events = self.events,
			element = self.element;

		if (self.local) {
			menu.unbind('mouseleave', events.mouseleave)
				.unbind('mouseenter', events.mouseenter);
		} else {
			menu.remove();
		}

		element.unbind(self.options.trigger, events.show);
	},
	menu : null,
	local : false,
	popup : true,
	// orgin_top : null,
	child_menu : false,
	isOpen : function() {
		return !iu.tool.none(this.menu);
	},
	show : function(e) {
		this.events.show(e);
	},
	hide : function(e) {
		this.events.hide(e);
	},
	_createMenu : function() {
		var self = this,
			menu, parent,
			element = self.element,
			options = self.options,
			events = self.events,
			type = iu.tool.type;
	
		function build(options, level) {
			var menu, sub, li, i, length, option, text;

			if (type(options, 'string') || options.jquery) {
				menu = $(options);

				if (self.local = !level) {
					menu.css('position') == 'static' && menu.css('position', 'absolute');
					menu.parent().css('position') == 'static' && menu.parent().css('position', 'relative');
				}

				return menu;
			}

			if (type(options, 'object')) {
				options = parseObject2Array(options);
			}

			if (!type(options, 'array')) {
				return $();
			}

			level ? 0 : level = 0;
			menu = $('<ul class="iu_menu iu_menu_level_' + level + '"></ul>');

			for (i = 0, length = options.length; i < length; i++) {
				option = options[i];

				if (type(option, 'object')) {
					// li

					text = iu.tool.buildText(option);
					li = $('<li class="iu_menu_li' + text.css + '">'
								+ '<a' + text.langid + '>' + text.text + '</a>'
							+ '</li>');

					a = li.children('a');
					option.href && a.attr('href', option.href);
					option.title && a.attr('title', option.title);
					option.icon && a.prepend('<span class="iu_menu_icon ' + option.icon + '"></span>');

					sub = option.menu;

					if (sub && (type(sub, 'array') || type(sub, 'object'))) {
						li.append('<span class="iu_menu_icon_sub"></span>');
						li.append(build(sub, level + 1));
					}

					if (type(option.click, 'function')) {
						(function(click, li) {
							li.bind('click', function(e) {
								if (e.target == li.get(0) || $(e.target).parent().get(0) == li.get(0)) {
									return click.call(element, e);
								}
							});
						})(option.click, li);
					}

					type(option.mouseenter, 'function') && li.bind('mouseenter', option.mouseenter);
					type(option.mouseleave, 'function') && li.bind('mouseleave', option.mouseleave);

				} else if (option == null || type(option, 'string')) {
					// separator
					// null -- default separator
					// string -- separator with class
					li = $('<li class="iu_menu_sep' + (option ? ' ' + option : '') + '"></li>');
				}

				menu.append(li);
			}

			return menu;
		}

		function parseObject2Array(obj) {
			var arr = [], item, menu, text, href;

			for (text in obj) if (iu.tool.own(obj, text)) {
				item = obj[text];

				if (item) {
					menu = {text : text};
					type(item, 'function') ? menu.click = item : menu.href = item;
				} else {
					menu = item === '' ? text : null;
				}

				arr.push(menu);
			}

			return arr;
		}

		menu = build(options.menu);
		self.menu = menu;

		if (self.local) {
			self.popup = true;
			// parent = menu.parent();
			self.child_menu = element.find(menu[0]).length > 0;
		} else {
			self.popup = !options.follow;

			parent = self.popup ? element.offsetParent() : $(document.body);
			parent.append(menu);

			self.initPopup();

			menu.find('span.iu_menu_icon_sub').parent().each(function(i, tag) {
				var none = !$(tag).siblings('a').attr('href');

				$(tag).bind('click', function(e) {
					if ((none && e.target == tag) || $(e.target).parent().get(0) == tag) {
						return false;
					}
				});
			});
		}

		events = self.events;
		options.trigger == 'rightclick' ? options.trigger = 'contextmenu' : 0;
		options.hold ? options.hold = (function(str){
			var ret = {}, i = 0, length;
			str = (str + '').split(' ');
			for (length = str.length; i < length; i++) {
				ret[str[i]] = 1;
			}
			return ret;
		})(options.hold) : 0;
		element.bind(options.trigger, events.show);

		menu.bind('mouseleave', events.mouseleave)
			.bind('mouseenter', events.mouseenter);

		iu.tool.css(menu, options, ['width', 'height', 'whiteSpace', 'zIndex']);
	},
	initPopup : function() {
		var self = this,
			options = self.options,
			element = self.element,
			menu = self.menu,
			align = options.align,
			top = parseFloat(options.top) || 0,
			left = parseFloat(options.left) || 0;

		offset = element.position();
		left += offset.left;
		top += offset.top;

		if (align.indexOf('right') > -1) {
			left += element.outerWidth() - menu.outerWidth();
		}

		if (align.indexOf('top') > -1) {
			top -= menu.outerHeight();
		} else {
			top += element.outerHeight();
		}

		menu.css('top', top);
		menu.css('left', left);
	},
	calcPosition : function(e) {
		var self = this,
			element = self.element,
			menu = self.menu,
			options = self.options;

		var body_scroll_top = iu.tool.bodyScrollTop();

		// calc popup
		if (self.popup) {
			self.local || self.initPopup();

			if (options.view == 'fixed') {
				return;
			}

			var parent = iu.tool.scrollParent(menu),
				parent_offset_top = parent.offset().top,

				menu_offset_top, orgin_top, top,
				menu_height = menu.outerHeight(),

				element_height = element.outerHeight(),
				element_top = element.position().top,
				element_offset_top = element.offset().top,
				
				border_up = Math.max(parent_offset_top, body_scroll_top),
				border_down = Math.min(parent_offset_top + parent.outerHeight(), body_scroll_top + iu.tool.windowHeight()),
				height_up, height_down;

			menu.show();
			menu_offset_top = menu.offset().top;

			if (self.orgin_top == null) {
				self.orgin_top = orgin_top = menu.position().top;
			} else {
				orgin_top = self.orgin_top;
			}

			menu.hide();

			if (self.child_menu) {
				// menu is a posterity of element
				top = element.css('position') == 'static' ? element.position().top : orgin_top;
			} else {
				top = element.position().top;
			}

			height_up = element_offset_top - border_up;
			height_down = border_down - (element_offset_top + element_height);

			if (height_up > height_down) {
				// to up
				if (self.child_menu) {
					if (menu_offset_top > element_offset_top) {
						top -= menu_height;
					}
				} else {
					top -= menu_height;
				}
			} else {
				// to down
				if (self.child_menu) {
					if (menu_offset_top <= element_offset_top) {
						top += element_height;
					}
				} else {
					top += element_height;
				}
			}

			menu.css('top', top);
			return;
		}

		// calc contextmenu
		if (!e) {
			return;
		}
		
		var menu_width = menu.outerWidth(),
			menu_height = menu.outerHeight(),
			win = $(window),
			win_width = win.outerWidth(),
			win_height = win.outerHeight(),
			element_offset = element.offset(),
			element_width = element.width(),
			position = iu.tool.getMouse(e),
			offset = iu.tool.getViewOffset(e),
			top = position.y + options.top,
			left = position.x + options.left,
			diff = offset.top + menu_height - win_height;

		if (diff > 0) {
			top -= diff + 4;
		}

		if (top < body_scroll_top) {
			top = body_scroll_top;
		}

		diff = offset.left + menu_width - win_width;
		if (diff > 0) {
			left -= menu_width;
		}

		offset.left ? 0 : offset.left = 1;
		if (((offset.left - element_offset.left) / (offset.right - (win_width - element_offset.left - element_width))) > 2
			|| diff > 0) {

			menu.addClass('iu_menu_left');
		} else {
			menu.removeClass('iu_menu_left');
		}

		diff = element_offset.left + element_width - menu_width;
		if (left > diff) {
			left = diff;
		}

		menu.css('top', top).css('left', left);
	},
	events : {
		show : function(e) {
			var self = this, options;

			options = self.options;
			self.clear();

			if (iu.tool.none(self.menu)) {
			} else {
				if (options.toggle) {
					self.calcPosition(e);
					return options.trigger != 'contextmenu';
				}
			}

			e ? 0 : e = false;
			self.calcPosition(e);

			if (iu.tool.type(options.beforeshow, 'function') && false === options.beforeshow.call(self)) {
				return;
			}

			self.delay(function() {
				iu.tool.animateShow(self.menu, options.animate, function() {
					options.autoHide > 0 && self.delay('hide', options.autoHide);

					$(document)
						.bind('contextmenu', {immediate : true}, self.events.hide)
						.bind('click', self.events.hide);

					self.element.bind('mouseleave', self.events.mouseleave);
					iu.tool.type(options.aftershow, 'function') && options.aftershow.call(self);
				});
			}, options.delayIn);

			return e.type != 'contextmenu';
		},
		hide : function(e) {
			var self = this, options = self.options, menu, hide;

			if (e) {
				if (iu.tool.none(self.menu)) {
					return;
				}

				if (self.popup) {
					if (iu.tool.holdWidget(e, self.element, self.menu)) {
						if (e.type == 'contextmenu') {
							return options.inspectable;
						}

						if (e.type == options.trigger) {
							return;
						}

						if (options.hold[e.type]) {
							return;
						}
					}
				} else if (e.type == options.trigger) {
					return;
				}
			} else {
				e = false;
			}

			self.clear();
			menu = self.menu;

			if (iu.tool.type(options.beforehide, 'function') && false === options.beforehide.call(self)) {
				return;
			}

			hide = function() {
				$(document).unbind('contextmenu click', self.events.hide);
				self.element.unbind('mouseleave', self.events.mouseleave);
				iu.tool.type(options.afterhide, 'function') && options.afterhide.call(self);
			};

			if (e.data && e.data.immediate) {
				menu.hide();
				hide();
			} else {
				iu.tool.animateHide(menu, options.animate, hide);
			}
		},
		mouseenter : function(e) {
			this.clear();
		},
		mouseleave : function(e) {
			var self = this;

			if (iu.tool.none(self.menu)) {
				return;
			}

			self.delay('hide', [e], self.options.delayOut);
		},
		contextmenu : function(e) {
			return this.options.inspectable;
		}
	},
	options : {
		menu : null, // selector|object|array|jQuery Object
		// menu : '#menu', {menu : function() {}}, {menu : '/user/logout'}, [ 'sep', { text : 'menu', icon : 'icon_user', href : '/user/logout', click : function() {}, enter : function() {}, leave : function() {}} ]
		trigger : 'click',
		align : 'left|bottom', // left|right|top|bottom, default 'left|bottom', ignore 'left' if it contains 'right', ignore 'bottom' if it contains 'top'
		follow : false, // follow where the event happens
		view : 'auto', // auto|fixed change the menu's position above|below
		inspectable : true, // allow user to inspect the menu's dom element
		toggle : true, // toggle menu
		hold : false, // false|click, false|'click touchstart' hold event
		animate : 'none', // none|slide|fade
		delayIn : 0, // delay show, useful if trigger is mouseover|mouseenter
		delayOut : 400, // delay hide
		autoHide : 5000, // boolean|number, autoHide used on mobile
		width : null, // menu width
		height : null, // menu height
		whiteSpace : null,
		zIndex : null,
		top : 0, // top offset of mouse, used in context menu
		left : 0, // left offset of mouse, used in context menu

		aftershow : null, // callback after show
		afterhide : null, // callback after hide
		beforeshow : null, // callback before show
		beforehide : null // callback before hide
	}
});