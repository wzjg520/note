/**
 * iu.placeholder.js
 * */
iu.widget('placeholder', {
	init : function(text) {
		if (text) {
			this.options.text = text;
		}

		this._createPlaceHolder();
	},
	destroy: function() {
		var self = this, events = self.events;

		iu.tool.uninput(self.element, events.input);
		self.element.unbind('click blur', events.input);

		if (self.local) {
			self.placeholder.unbind('mousedown', events.mousedown).unbind('mouseup', events.mouseup);
		} else {
			self.placeholder.remove();
		}
	},
	// placeholder : null,
	reflow : function() {
		this.element.val() ? this.placeholder.hide() : this.placeholder.show();
	},
	_createPlaceHolder : function() {
		var self = this,
			options = self.options,
			element = self.element,
			events = self.events,
			position = element.position(),
			bgcolor, index,
			reflow = true,
			parse = function(css) {
				return parseFloat(element.css(css)) || 0;
			},
			placeholder = $('<div style="position:absolute;"></div>');

		if (options.selector) {
			self.local = true;
			placeholder = $(options.selector);
		} else {
			if (element.css('position') == 'static') {
				index = null;
			} else {
				bgcolor = element.css('background-color');
				index = (parseInt(element.css('z-index')) || 0);

				if (bgcolor == 'transparent' || (/rgba/.test(bgcolor) && / 0\)$/.test(bgcolor))) {
					index--;
					reflow = false;
				} else {
					index++;
				}
			}

			placeholder.css({
				color : options.color,
				fontSize : element.css('font-size'),
				lineHeight : options.lineHeight || element.css('height'),
				top : position.top + parse('margin-top') + (parseInt(options.top) || 0),
				left : position.left + parse('margin-left') + (parseInt(options.left) || 0),
				paddingTop : parse('padding-top') + parse('border-top-width'),
				paddingLeft : parse('padding-left') + parse('border-left-width'),
				zIndex : index
			})
			.html(options.text);

			if (options.insert == 'after') {
				placeholder.insertAfter(element);
			} else {
				placeholder.insertBefore(element);
			}
		}

		if (element.val()) {
			placeholder.hide();
		}

		self.placeholder = placeholder;

		iu.tool.input(element, events.input);

		if (reflow) {
			placeholder.bind('mousedown', events.mousedown).bind('mouseup', events.mouseup);
			element.bind('click blur', events.input);
		}
	},
	events : {
		input : function(e) {
			this.reflow();
		},
		mousedown : function(e) {
			this.element.focus();
			return false;
		},
		mouseup : function(e) {
			e.which == 3 && this.placeholder.hide();
			this.element.focus(); // bug ie 8 下点击水印无法使 input 聚焦
		}
	},
	options : {
		text : '\u8bf7\u8f93\u5165\u6587\u672c', // 提示文字
		color : '#aaa', // 提示颜色
		top : 0,
		left : 2,
		lineHeight : null,
		insert : 'after',
		selector : null // 提示DOM, 已有DOM元素, 优先级高于以上所有元素
	}
});