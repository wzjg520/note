/**
 * iu.tip.js
 * */
iu.widget('tip', {
	init : function(text) {
		var self = this,
			options = self.options;

		text == null ? 0 : options.text = text;

		if (options.text == null) {
			if (text = self.element.attr('title')) {
				options.text = iu.tool.escapeHTML(text).replace(/\n/g, '<br/>');
				self.element.removeAttr('title').attr('data-title', text);
			}
		}

		self._createTip();

		if (options.show) {
			self.show();
		}
	},
	destroy : function() {
		var self = this,
			element = self.element,
			events = self.events,
			text;

		element
			.unbind(self.options.showTrigger, events.show)
			.unbind(self.options.hideTrigger, events.hide);

		$(window).unbind('resize', events.resize);
		$(document).unbind('click', events.persist);

		self.tip.remove();

		if (text = element.attr('data-title')) {
			element.removeAttr('data-title').attr('title', text);
		}
	},
	local : false,
	tip : null,
	triangle : null,
	isOpen : function() {
		return !iu.tool.none(this.tip);
	},
	show : function() {
		this.events.show();
	},
	hide : function() {
		this.events.hide();
	},
	setOption : function(key, value) {
		var self = this, tip = self.tip;

		if (arguments.length == 1) {
			tip.children('div.iu_tip_text').html(key);

			return;
		}

		switch (key) {
			case 'triangleTop' : {
				self.triangle.css('top', value);
				break;
			}
			case 'triangleLeft' : {
				self.triangle.css('left', value);
				break;
			}
			case 'triangle' : {
				if (value) {
					self.triangle.show();
				} else {
					self.triangle.hide();
				}
			}
			case 'top' : 
			case 'left' :
			case 'position' : {
				if (self.isOpen()) {
					self.calcPosition();
				}
				break;
			}
			case 'show' : {
				if (value == false) {
					self.hide();
				} else {
					self.show();
				}
				break;
			}
		}
	},
	calcPosition : function() {
		var self = this,
			element = self.element,
			tip = self.tip,
			parent = tip.parent(),
			triangle = self.triangle,
			options = self.options,

			top = 0,
			left = 0,
			element_offset,

			position = (options.position + '').split('|'),
			POS = {
				top : 1,
				bottom : 2,
				left : 11,
				right : 12,
				center : 21
			},
			x = POS[position[0]] || POS.top,
			y = POS[position[1]] || POS.left,
			css,
			display,
			tip_width,
			tip_height;

		if (x == POS.center) {
			css = y == POS.right ? 'left' : 'right';
		} else {
			css = {
				'1' : 'bottom',
				'2' : 'top',
				'11' : 'right',
				'12' : 'left'
			}[x] || 'bottom';
		}

		triangle.attr('class', 'iu_tip_triangle iu_tip_triangle_' + css);

		if (parent[0] == document.body) {
			element_offset = element.offset();
		} else {
			element_offset = element.position();
			top = (parseFloat(element.css('margin-top')) || 0);
			left = (parseFloat(element.css('margin-left')) || 0);
		}

		top += element_offset.top + (parseFloat(options.top) || 0);
		left += element_offset.left + (parseFloat(options.left) || 0);

		// to fix // ie8
		display = tip.css('display');
		tip.css('visibility', 'hidden').show();
		tip_width = tip.outerWidth();
		tip_height = tip.outerHeight();
		tip.css('visibility', '').css('display', display);

		if (x == POS.top || x == POS.bottom) {
			if (y == POS.right) {
				if (options.inside) {
					left += element.outerWidth() - tip_width;
				} else {
					left += element.outerWidth();
				}
			} else if (y == POS.center) {
				left += (element.outerWidth() - tip_width) / 2;
			} else {
				if (!options.inside) {
					left -= tip_width;
				}
			}
		} else {
			if (y == POS.bottom) {
				if (options.inside) {
					top += element.outerHeight() - tip_height;
				} else {
					top += element.outerHeight();
				}
			} else if (y == POS.center) {
				top += (element.outerHeight() - tip_height) / 2;
			} else {
				if (!options.inside) {
					top -= tip_height;
				}
			}
		}

		if (x == POS.top) {
			top = top - tip_height - triangle.outerHeight(true);
		} else if (x == POS.bottom) {
			top = top + element.outerHeight() + triangle.outerHeight() - (parseFloat(triangle.css('margin-top')) || 0) - (parseFloat(triangle.css('margin-bottom')) || 0);
		} else if (x == POS.right) {
			left = left + element.outerWidth() + triangle.outerWidth() - (parseFloat(triangle.css('margin-left')) || 0) - (parseFloat(triangle.css('margin-right')) || 0);
		} else {
			left = left - tip_width - triangle.outerWidth(true);
		}

		tip.css('top', top);
		tip.css('left', left);
	},
	_createTip : function() {
		var self = this,
			options = self.options,
			events = self.events,
			text, element, tip, triangle;

		(self.tip && self.tip.remove) && self.tip.remove();

		tip = $('<div class="iu_tip" style="display:none">'
					+ '<div class="iu_tip_inner">'
						+ '<div class="iu_tip_text"></div>'
						+ '<div class="iu_tip_triangle"></div>'
					+ '</div>'
				+ '</div>');

		text = tip.find('div.iu_tip_text');

		options.css && tip.addClass(options.css);
		options.nowrap 	&& text.addClass('iu_nowrap');

		if (options.selector) {
			self.local = true;
			text.append($(options.selector));
		} else {
			options.text ? 0 : options.text = iu.tool.getText(options.langid);
			text.html(options.text);
		}

		self.tip = tip;
		
		element = self.element;
		element.after(tip);

		iu.tool.css(tip, options, 'width,height,zIndex');

		self.triangle = triangle = tip.find('div.iu_tip_triangle');
		options.triangle == false && triangle.hide();
		options.triangleTop == null || triangle.css('top', options.triangleTop);
		options.triangleLeft == null || triangle.css('left', options.triangleLeft);

		options.showTrigger && element.bind(options.showTrigger, events.show);
		options.hideTrigger && element.bind(options.hideTrigger, events.hide);
	},
	events : {
		show : function(e) {
			var self = this, options, callback;

			self.clear();

			if (self.isOpen()) {
				return;
			}

			options = self.options;
			callback = function() {
				self.calcPosition();
				iu.tool.animateShow(self.tip, options.animate, function() {
					options.autoHide > 0 && self.delay('hide', options.autoHide);

					$(window).bind('resize', self.events.resize);
					$(document).bind('click', self.events.persist);
				});
			};

			if (options.delayIn > 0 && e && e.type) {
				self.delay(callback, options.delayIn);
			} else {
				callback();
			}
		},
		hide : function(e) {
			var self = this, options, callback;

			self.clear();

			options = self.options;
			callback = function() {
				iu.tool.animateHide(self.tip, options.animate, function() {
					$(window).unbind('resize', self.events.resize);
					$(document).unbind('click', self.events.persist);

					options.once && self.destroy();
				});
			};

			if (options.delayOut > 0 && e && e.type) {
				self.delay(callback, options.delayOut);
			} else {
				callback();
			}
		},
		resize : function(e) {
			this.calcPosition();
		},
		persist : function(e) {
			var self = this;

			self.options.persist || iu.tool.holdWidget(e, self.element, self.tip)
				?
					0 : self.hide();
		}
	},
	options : {
		text : null, // tip text
		langid : null, // tip text langid
		css : null, // tip class
		selector : null, // css selector, a replaceable parameter of text
		position : 'top|left', // top|right|bottom|left|center, default 'top|left', see html title
		inside : true, // tip inside of element
		showTrigger : 'mouseenter',
		hideTrigger : 'mouseleave',
		autoHide : false, // int|false, auto hide 5000 ms after the tip shown, false or less than 0 to prevent auto hide
		delayIn : 0,
		delayOut : 0,
		show : false, // visible when created
		persist : false,
		once : false,
		animate : 'none', // none|fade|slide
		triangle : true, // false -- none triangle
		triangleTop : null,
		triangleLeft : null,
		nowrap : false,
		width : null,
		height : null,
		zIndex : null,
		top : 0,
		left : 0
	}
});