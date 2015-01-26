/**
 * iu.dialog.js
 * */
iu.widget('dialog', {
	init : function() {
		var self = this;

		self._createDialog();
		
		if (iu.tool.type(self.options.init, 'function') && false === self.options.init.call(self.dialog, self)) {
			return false;
		}

		if (self.options.show) {
			self.show();
		}
	},
	destroy : function(jquery) {
		var self = this, key, style, origin;

		self._container.unbind('resize', self.events.resize);
		$(self.options.appendTo).unbind('keyup', self.events.esc);

		if (origin = self._origin) {
			self._content[origin[0]](origin[1]);
			self._content.removeClass('iu_dialog_content');

			style = self._content[0].style;

			for (key in self._style) if (iu.tool.own(self._style, key)) {
				style[key] = self._style[key];
			}
		}

		self.dialog.parent().remove();
	},
	// dialog : null,
	// _origin : null, // the dialog html dom's original position, retore where it is after the dialog destroyed
	// _style : null,
	// _container : null, // dialog content, the panel's parent or window (when the panel's parent is document.body)
	// _append : null, // $(options.appendTo)
	// _panel : null, // the whole dialog, include the mask
	// _content : null, // dialog content
	// _isOpen : false,
	_resize : true,
	// show : function() {},
	// hide : function() {},
	isOpen : function() {
		return this._isOpen;
	},
	resize : function() {
		this.isOpen() && this.events.resize();
	},
	getContent : function() {
		if (this._content) {
			return this._content;
		}

		if (this.options.clone) {
			return this.element.clone();
		}

		return this.element;
	},
	setContent : function (content) {
		this._content.html(content);
	},
	resetPosition : function() {
		this._resize = true;
		this.isOpen() && this.events.resize();
	},
	setOption : function(key, value) {
		var self = this;

		switch (key) {
			case 'mask' : {
				self._createMask(value);
				break;
			}
			case 'opacity' : {
				self._createMask(null, value);
				break;
			}
			case 'title' : {
				self._createTitle(value);
				break;
			}
			case 'close' : {
				self._createClose(value);
				break;
			}
			case 'buttons' : {
				self._createButtons(value, arguments[2]);
				self.isOpen() && self.events.resize();

				break;
			}
			case 'content' : {
				self.setContent(value);
				self.isOpen() && self.events.resize();

				break;
			}
			case 'buttonsAlign' : {
				self._createButtons(null, value);
				break;
			}
			case 'show' : {
				if (value == null) {
					self.show();
					break;
				}

				value ? self.show() : self.hide();
				break;
			}
			case 'draggable' : {
				if (value == true) {
					iu('drag', self.dialog, {
						handle : '.iu_dialog_title',
						stop : function(e, offset) {
							self._resize = false;
						}
					});
				} else if (value == false) {
					iu('drag', self.dialog).destroy();
				}
			}
		}
	},
	_createDialog : function() {
		var self = this,
			events = self.events,
			options = self.options, style,
			append = $(options.appendTo),
			container, scroll_container, panel, dialog, content;

		panel = $('<div class="iu_dialog_panel" style="display:none">'
					+ '<div class="iu_dialog_mask"></div>'
					+ '<div class="iu_dialog">'
						+ '<div class="iu_dialog_title"></div>'
						// + '<div class="iu_dialog_content"></div>'
						+ '<div class="iu_dialog_buttons"></div>'
					+ '</div>'
				+ '</div>');

		append.append(panel);
		dialog = panel.children('.iu_dialog');

		if (append[0] === document.body) {
			scroll_container = $('html');
			container = $(window);
		} else {
			scroll_container = append;
			container = append;
			container.css('position') == 'static' && container.addClass('iu_relative');

			panel.addClass('iu_absolute');
		}

		self._container = container;
		self._panel 	= panel;
		self.dialog 	= dialog;

		// sepecial
		if (options.content) {
			content = $('<div>' + options.content + '</div>');
		} else {
			content = self.getContent();
			content == null ? content = 0 : 0;

			if (content.jquery) {
				self._origin = content.prev().length ? ['insertAfter', content.prev()] :
									content.next().length ? ['insertBefore', content.next()] :
										content.parent().length ? ['prependTo', content.parent()] : null;

				style = content[0].style;

				self._style = {
					display : style.display,
					visibility : style.visibility,
					width : style.width,
					height : style.height
				};

				content.show();
			} else {
				content = $('<div></div>').append(content);
			}
		}

		self._content = content.addClass('iu_dialog_content');
		content.insertAfter(dialog.find('div.iu_dialog_title'));

		var scroll_bar_width,
			margin_right,
			overflow_y;

		function show() {
			if (self._isOpen) {
				return;
			}

			if (options.freeze) {
				try {
					if (overflow_y == null) {
						overflow_y = append.get(0).style.overflowY;

						if (overflow_y != 'hidden') {
							scroll_bar_width = iu.tool.scrollBarWidth(scroll_container);

							if (scroll_bar_width > 0) {
								margin_right = scroll_container.get(0).style.marginRight;
								scroll_container
									.css('margin-right', scroll_bar_width + (parseFloat(scroll_container.css('margin-right')) || 0))
									.css('overflow-y', 'hidden');
							}
						}
					}
				} catch (e) {
				}
			}

			panel.css('visibility', 'hidden').show();
			events.resize();
			panel.hide().css('visibility', '');

			if (iu.tool.none(panel)) {
				// bug show called twice
				if (iu.tool.type(options.beforeshow, 'function') && false === options.beforeshow.call(self)) {
					return;
				}

				var callback = function() {
					self._isOpen = true;
					container.bind('resize', events.resize);
					options.esc && append.bind('keyup', events.esc);
					iu.tool.type(options.aftershow, 'function') && options.aftershow.call(self);
				};

				if (options.animate == 'slide') {
					dialog.hide();
					panel.show();
					dialog.slideDown(options.duration, callback);
				} else {
					iu.tool.animateShow(panel, options.animate, callback, options.duration);
				}
			} else {
				self._isOpen = true;
			}
		}

		function hide() {
			var style;

			if (!self._isOpen) {
				return;
			}

			if (iu.tool.type(options.beforehide, 'function')) {
				if (false === options.beforehide.call(self)) {
					return false;
				}
			}

			if (scroll_bar_width > 0) {
				style = scroll_container.get(0).style;
				style.marginRight = margin_right;
				style.overflowY = overflow_y;
				overflow_y = null;
			}

			if (!iu.tool.none(panel)) {
				options.esc && append.unbind('keyup', events.esc);
				container.unbind('resize', events.resize);

				var callback = function() {
					if (iu.tool.type(options.afterhide, 'function')) {
						options.afterhide.call(self);
					}

					if (options.once) {
						self.destroy();
					}
				};

				if (options.animate == 'slide') {
					dialog.slideUp(options.duration, function() {
						panel.hide();
						dialog.show();

						callback();
					});
				} else {
					iu.tool.animateHide(panel, options.animate, callback, options.duration);
				}
			}

			self._isOpen = false;
		}

		self.show = show;
		self.hide = hide;

		// create parts
		self._createMask(options.mask, options.opacity);
		self._createTitle(options.title);
		self._createClose(options.close);
		self._createButtons(options.buttons, options.buttonsAlign);

		// quick custom
		false === options.radius 	? options.radius = '' : 0;
		false === options.shadow 	? options.shadow = '' : 0;
		false === options.padding 	? options.padding = '' : 0;

		options.radius == null || dialog.css('border-radius', options.radius);
		options.shadow == null || dialog.css('box-shadow', options.shadow);
		options.id == null || panel.attr('id', options.id);
		options.css == null || panel.addClass(options.css);
		options.zIndex == null || panel.css('zIndex', options.zIndex);
		panel.children('.iu_dialog_mask').bind('click', events.persist);

		iu.tool.css(content, options, 'width,height,padding');
		self.setOption('draggable', options.draggable);
	},
	_createMask : function(color, opacity) {
		if (false === color) {
			this.dialog.parent().css('height', 0);
			return;
		}

		if (color == null && opacity == null) {
			return;
		}

		var mask = this.dialog.parent().css('height', '').find('div.iu_dialog_mask');

		color && mask.css('background-color', color);
		opacity >= 0 && mask.css('opacity', opacity);
	},
	_createTitle : function(option) {
		var dialog = this.dialog,
			title = dialog.find('div.iu_dialog_title'), align;

		if (iu.tool.type(option, 'object')) {
			/* title : {
				align : 'left',
				text : 'text',
				langid : 'id',
				css : 'class class'
			} */

			align = option.align;
			option = iu.tool.buildText(option);
			align ? option.css = ' iu_align_' + option.align + option.css : 0;

			title.attr('class', 'iu_dialog_title' + option.css);
			title.html(option.text);

		} else if (false === option) {
			title.addClass('iu_none');
		} else {
			title.removeClass('iu_none').html(option);
		}
	},
	_createClose : function(option) {
		var self = this,
			dialog = this.dialog,
			close = dialog.find('div.iu_dialog_close');

		if (close.length) {
			close.remove();
		}

		if (false === option) {
			return;
		}

		$('<div class="iu_dialog_close">'
			+ '<span class="iu_dialog_close_text">&times;</span>'
		+ '</div>')
		.appendTo(dialog)
		.bind('click', self.events.hide);
	},
	_createButtons : function(option, align) {
		var self = this, it = iu.tool,
			i, key, length,
			text, button, item,
			container = self.dialog.children('div.iu_dialog_buttons');

		if (false === option) {
			container.addClass('iu_none');
			container.find('.iu_dialog_button').remove();

			return;
		}

		if (it.type(option, 'object')) {
			option = parseObject2Array(option);
		}

		if (!option || !it.type(option, 'array') || !option.length) {
			return;
		}

		container.removeClass('iu_none');
		align && container.attr('class', 'iu_dialog_buttons iu_align_' + align);

		/*
			buttons : {
				Ok : function Ok(e) {
					if (1) {
						return false;
					}
				},
				Cancel : function Cancel(e) {}
			}
			buttons : [
				{
					text : 'text',
					langid : 'id',
					click : function click(e) {},
					css : 'class class'
				}
			]
		*/
		function parseObject2Array(obj) {
			var buttons = [], key;

			for (key in obj) if (it.own(obj, key)) {
				buttons.push({
					text : key,
					click : obj[key]
				});
			}

			return buttons;
		}

		container.find('a.iu_dialog_button').remove();

		for (i = 0, length = option.length; i < length; i++) {
			item = option[i];
			text = it.buildText(item);

			button = $('<a class="iu_dialog_button iu_dialog_button_' + i + text.css + '">'
						+ '<span class="iu_dialog_button_text"' + text.langid + '>' + text.text + '</span>'
					+ '</a>');

			(function(click) {
				button.bind('click', function(e) {
					false === click.call(self, e, button[0]) || self.hide();
				});
			})(it.type(item.click, 'function') ? item.click : it.noop);

			container.append(button);
		}
	},
	events : {
		esc : function(e) { if (e.which == iu.tool.key.ESC)
			this.hide(e);
		},
		show : function(e) {
			this.show();
		},
		hide : function(e) {
			this.hide(e);
		},
		resize : function(e) {
			var self = this;

			if (!self._resize) {
				return;
			}

			var container = self._container,
				dialog = self.dialog,
				height = dialog.outerHeight(),
				options = self.options,
				container_height = container.outerHeight(),
				container_width = container.outerWidth(),
				diff,
				top, left;

			diff = container_height - height;

			if (diff > 0) {
				if (options.align == 'middle') {
					top = diff / 2;
				} else {
					// auto align
					if (diff / height < 0.618) { // 0.382 / 0.618
						top = diff / 2;
					} else {
						top = container_height * 0.382 - height / 2;
					}
				}
			} else {
				top = 0;
			}

			left = (container_width - dialog.outerWidth()) / 2; 
			left += (parseFloat(options.left) || 0); 
			isNaN(left) ? left = 0 : 0; 
			top += (parseFloat(options.top) || 0); 
			isNaN(top) ? top = 0 : 0; 

			dialog.css('top', top).css('left', left);
		},
		persist : function(e) {
			this.options.persist || this.hide(e);
		}
	},
	options : {
		title : false,/*{
			align : 'left',
			langid : 'langid',
			text : 'Title',
			css : 'iu_dialog_title_warn'
		}*/ // {}|string|boolean, false means no title
		content : null, // dialog content, high priority
		clone : false, // clone the element outerHTML rather than move the dom element
		// {}|callback|false
		buttons : false, /*[{
			langid : 'ok',
			text : 'Ok',
			css : 'iu_button_yes',
			click : function(e) {
				return false; // return false to prevent the diaog hide
			}
		}] or {
			Ok : function click(e, dialog) {},
			Cancel : function Cancel(e, dialog) {}
		}*/ // dialog will be closed after click callback, dialog don't close when click callback return false
		buttonsAlign : 'center', // left|center|right
		close : true, // show close button
		id : null, // iu dialog id
		css : null, // iu dialog class
		appendTo : 'body',
		align : 'auto', // auto|middle, vertical align
		mask : null, // color|false, default #000 in css
		opacity : null, // float < 1, default 0.5 in css
		esc : false, // hidden dialog when esc key pressed
		freeze : false, // prevent body scroll bar when the dialog is visibile
		once : false, // used only once
		persist : false, // hidden dialog when the outside of dialog clicked
		show : true, // visible when created
		animate : 'fade', // none|fade|slide|flip, // only fade is valid
		duration : 200,
		// style quick set
		radius : null, // legal border-radius style
		shadow : null, // legal box-shadow style
		padding : null, // legal padding style
		width : null,
		height : null,
		zIndex : null,
		top : 0,
		left : 0,

		// effect
		draggable : null,

		aftershow : null, // function() {}
		beforeshow : null, // function() {}
		afterhide : null, // function() {}
		beforehide : null // function() {}
	}
});

// todo
/**
 * iu.dialgAlert
 * */
iu.widget('dialogAlert', 'dialog', {
	init : function(text) {
		var self = this,
			options = self.options,
			show = options.show;

		if (text != null) {
			options.text = text;
		} else {
			text = iu.tool.buildText(options);
			options.text = text.text;
		}

		if (!options.buttons) {
			options.buttons = {};
			options.buttons[options.positiveText] = function() { if (iu.tool.type(options.positive, 'function'))
				return options.positive.call(self);
			};
		}

		options.show = false;

		self._super.init();
		self._panel.addClass('iu_dialogalert');
		self.dialog.find('div.iu_dialog_content').prepend('<span class="iu_icon iu_icon_dialog_alert"></span>');

		if (show) {
			options.show = show;
			self.show();
		}
	},
	getContent : function() {
		return this.options.text;
	},
	options : {
		positive : null, // callback when click Ok
		positiveText : 'Ok', // positive button text
		text : null,
		langid : null,
		esc : false,
		close : false, // bug
		persist : true,
		once : true,
		show : true
	}
});

/**
 * iu.dialogConfirm
 * */
iu.widget('dialogConfirm', 'dialog', {
	init : function(text) {
		var self = this,
			options = self.options,
			show = options.show;

		if (text != null) {
			options.text = text;
		} else {
			text = iu.tool.buildText(options);
			options.text = text.text;
		}

		if (!options.buttons) {
			options.buttons = {};
			options.buttons[options.positiveText] = function() { if (iu.tool.type(options.positive, 'function'))
				return options.positive.call(self);
			};

			options.buttons[options.negativeText] = function() { if (iu.tool.type(options.negative, 'function'))
				return options.negative.call(self);
			};
		}

		options.show = false;

		self._super.init();
		self._panel.addClass('iu_dialogconfirm');
		self.dialog.find('div.iu_dialog_content').prepend('<span class="iu_icon iu_icon_dialog_confirm"></span>');

		if (show) {
			options.show = show;
			self.show();
		}
	},
	getContent : function() {
		return this.options.text;
	},
	options : {
		positive : null, // callback when click Ok
		negative : null, // callback when click cancel
		positiveText : 'Ok', // positive button text
		negativeText : 'Cancel', // negative button text
		text : null,
		langid : null,
		close : null, // if close is null, cancel will be called when the dialog is closed
		esc : false,
		persist : true,
		once : true,
		show : true
	}
});

/**
 * iu.dialogPrompt
 * */
iu.widget('dialogPrompt', 'dialog', {
	init : function() {
		var self = this,
			options = self.options;

		if (!options.buttons) {
			options.buttons = {};
			options.buttons[options.positiveText] = function() { if (iu.tool.type(options.positive, 'function'))
				return options.positive.call(self, self.val());
			};

			options.buttons[options.negativeText] = function() { if (iu.tool.type(options.negative, 'function'))
				return options.negative.call(self);
			};
		}

		options.css ? options.css += ' iu_dialogprompt' : options.css = 'iu_dialogprompt';
		self._super.init();
	},
	getContent : function() {
		this.prompt || this._createPrompt(this.options.text, this.options.value);

		return this.prompt;
	},
	val : function(value) {
		if (arguments.length) {
			this._input.val(value);
			return;
		}

		return this._input.val();
	},
	// prompt : null,
	// _input : null,
	_createPrompt : function(text, value) {
		text == null ? text = '' : 0;

		var self = this,
			prompt = self.options.textarea ?
						$('<div class="iu_dialogprompt_multi">'
							+ '<span class="iu_dialogprompt_title">' + text + '</span>'
							+ '<textarea class="iu_dialogprompt_textarea"></textarea>'
						+ '</div>')
						:
						$('<div class="iu_dialogprompt_single">'
							+ '<span class="iu_dialogprompt_title">' + text + '</span>'
							+ '<input type="text" class="iu_dialogprompt_input"/>'
						+ '</div>');

		prompt.children('span.iu_dialogprompt_title').html(text);
		self._input = prompt.children('input,textarea');

		self.prompt = prompt;
		self._input.val(value);
	},
	options : {
		position : null, // callback when click Ok
		negative : null, // callback when click cancel
		positiveText : 'Ok', // positive button text
		negativeText : 'Cancel', // negative button text
		textarea : false,
		text : null,
		langid : null,
		close : null, // if close is null, cancel will be called when the dialog is closed
		value : '',
		esc : false,
		persist : true,
		once : true,
		show : true,
		aftershow : function() {
			this._input.focus();
		}
	}
});