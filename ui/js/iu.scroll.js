/**
 * iu.scroll.js
 * */
iu.widget('scroll', {
	init : function() {
		var self = this;

		self.rate = 1;
		self.step = 120;

		self._tick = 10;
		self._time = 13;
		self._top = 0;
		self._direct = 0;

		self._createScroll();
	},
	destroy : function() {
		var self = this, element = self.element, events = self.events;

		if (iu.support.touch) {
			element.unbind('touchstart', events.show);
			element.unbind('touchmove', events.scroll);
			$(document).unbind('touchend', events.hide);
		} else {
			element.unbind('mouseenter', events.show);
			iu.tool.unmousewheel(self.element, events.mousewheel);
			element.unbind('mouseleave', events.hide);
			$(document).unbind('mouseup', events.mouseup);
		}

		$(window).unbind('resize', events.resize);
	},
	// scroll : null,
	// bar : null,
	// status : {}, // used in touch event so far
	show : function() {
		this.resize();
		this.scroll.stop().fadeTo(this.options.duration, this.options.opacity);
	},
	hide : function() {
		this.scroll.stop().fadeTo(this.options.duration, 0);
	},
	resize : function() {
		var self = this, element = self.element, scroll = self.scroll, position;

		position = element.position();
		scroll
			.css('top', position.top + (parseFloat(element.css('margin-top')) || 0) + (parseFloat(element.css('border-top-width')) || 0))
			.css('left', position.left + element.outerWidth(true)
						- scroll.outerWidth()
						- (parseFloat(element.css('margin-right')) || 0)
						- (parseFloat(element.css('border-right-width')) || 0));

		height = element.innerHeight();
		scroll.css('height', height);

		if ((self.rate = element[0].scrollHeight / height) > 0) {
			self.bar.css({
				height : height / self.rate,
				top : element[0].scrollTop / self.rate
			});
		} else {
			self.bar.css('height', 0);
		}
	},
	move : function(change) {
		var self = this,
			dom = self.element.stop()[0],
			bar = self.bar.stop(),
			tmp = dom.scrollTop,
			top = tmp + change;

		dom.scrollTop = top;
		top = dom.scrollTop;
		dom.scrollTop = tmp;

		self.element.animate({scrollTop : tmp}, 500);

		top /= self.rate;
		tmp = self.scroll.outerHeight() - bar.outerHeight();
		top < tmp ? 0 : top = tmp;

		bar.animate({top : top}, 500);
		self.options.autoHide > 0 && self.delay('hide', self.options.autoHide);

		return Math.abs(top - parseFloat(bar.css('top'))) < 5;
	},
	_createScroll : function() {
		var self = this,
			element = self.element,
			events = self.events,
			bar,
			scroll = $('<div class="iu_scroll">'
						+ '<div class="iu_scroll_bar"></div>'
					+ '</div>').insertAfter(element);

		self.scroll = scroll;
		self.bar = bar = scroll.children();
		bar.css('width', self.options.width);
		bar.css('background', self.options.background);
		scroll.css('zIndex', self.options.zIndex);

		element.css('overflow', 'hidden');
		$(window).bind('resize', events.resize);

		if (iu.support.touch) {
			element.bind('touchstart', events.show);
		} else {
			element.bind('mouseenter', events.show);
			iu.tool.mousewheel(element, events.mousewheel);
			element.bind('mouseleave', events.hide);

			var show = function() {
					self.clear();
					self.show();
				},
				hide = function() {
					self.delay('hide', 1000);
				};

			scroll.bind('mouseenter', show).bind('mouseleave', hide);

			iu('drag', bar, {
				axis : 'y',
				cursor : 'default',
				limit : scroll,
				start : function() {
					self.clear();

					element.unbind('mouseenter', events.show);
					element.unbind('mouseleave', events.hide);
					scroll.unbind('mouseenter', show).unbind('mouseleave', hide);
					$(document).bind('mouseup', events.mouseup);
				},
				drag : function(e, offset) {
					var top = offset.top * self.rate;
					element[0].scrollTop = top;
				},
				stop : function() {
					self.options.autoHide > 0 && self.delay('hide', self.options.autoHide);
					element.bind('mouseenter', events.show);
					element.bind('mouseleave', events.hide);
					scroll.bind('mouseenter', show).bind('mouseleave', hide);
					$(document).unbind('mouseup', events.mouseup);
				}
			});
		}
	},
	// _timeout_stop : null,
	// _timeout_start : null,
	// _started : false,
	// _stoped : false,
	_upTick : function() {
		// speed up
		var tick = this._tick + this._tick * this._friction;

		tick > 40 ? tick = 40 : 0;

		this._tick = tick;
	},
	_downTick : function(top) {
		// speed down
		var tick;

		top = Math.abs(top) / 10;
		top < 1 ? top = 1 : 0;
		tick = this._tick - (1 / top);
		// console.log('tick', tick)
		tick < 2 ? tick = 2 : 0;

		this._tick = tick;
	},
	_restoreTick : function() {
		this._tick = 10;
	},
	_mousewheel : function() {
		var self = this,
			dom = self.element[0],
			bar = self.bar;

		function scroll() {
			var direct = self._direct, limit, top, tmp;

			if (direct > 0) {
				// down
				self._top -= self._tick;
				limit = dom.scrollTop + self._tick;

				dom.scrollTop = limit;
				top = dom.scrollTop / self.rate;
				bar.css('top', top);

				// dom.scrollTop is int
				if (self._top <= 0 || dom.scrollTop < limit - 1) {
					tmp = self.scroll.outerHeight() - bar.outerHeight()
					top > tmp && bar.css('top', tmp);
					return clear();
				}
			} else if (direct < 0) {
				// up
				self._top += self._tick;
				limit = dom.scrollTop - self._tick;

				dom.scrollTop = limit;
				top = dom.scrollTop / self.rate;
				bar.css('top', top);

				if (self._top >= 0 || limit < 0) {
					top < 0 && bar.css('top', 0);
					return clear();
				}
			} else {
				return clear();
			}

			self._downTick(self._top);
			self._timeout_wheel = setTimeout(scroll, self._time);
		}

		function clear() {
			self._restoreTick();
			self._top = self._direct = 0;
			self.options.autoHide > 0 && self.delay('hide', self.options.autoHide);
			clearTimeout(self._timeout_wheel);
		}

		scroll();
	},
	events : iu.support.touch ? {
		resize : function() {
			this.resize();
		},
		show : function(e) {
			this.show();
			this.delay('hide', 1000);

			this.element.bind('touchmove', this.events.scroll);
			$(document).bind('touchend', this.events.hide);
			this.status = iu.tool.getMouse(e.originalEvent || e);
		},
		hide : function() {
			this.delay('hide', 500);
			this.element.unbind('touchmove', this.events.scroll);
			$(document).unbind('touchend', this.events.hide);
		},
		scroll : function(e) {
			// touchmove
			var position = iu.tool.getMouse(e.originalEvent || e), change = this.status.y - position.y;

			this.status = position;

			if (this.move(change * this.rate)) {
				return true;
			}

			return iu.tool.cancelEvent(e);
		}
	} :{
		resize : function() {
			this.resize();
		},
		mouseup : function(e) {
			iu.tool.holdWidget(e, this.element, this.scroll) || this.hide();
		},
		show : function(e) {
			this.show();
			this.delay('hide', 1000);
		},
		hide : function(e) {
			this.hide();
		},
		mousewheel : function(e) {
			var self = this, direct, step, top = self.element[0].scrollTop;

			direct = (e.originalEvent.wheelDelta || -e.originalEvent.detail) < 0;
			direct = direct ? 1 : -1;
			step = direct * self.step;

			self.clear();
			self.show();

			if (self._direct) {
				self._restoreTick();
				if (self._direct == direct) {
					self._top += step;
				} else {
					self._direct = direct;
					self._top = step;
				}
			} else {
				self._direct = direct;
				self._top = step;

				self._mousewheel();
			}

			top += step;

			return false;
		}
	},
	options : {
		autoHide : false,
		duration : 200,
		background : null,
		opacity : 1,
		width : 5,
		zIndex : null
	}
});