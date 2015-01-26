/**
 * iu.spinner.js
 * */
iu.widget('spinner', {
	init : function(val) {
		var self = this,
			options = self.options;

		if (val != null) {
			options.val = val;
		}

		self.decimal = options.decimal > 0 ? parseInt(options.decimal) || 0 : Math.abs(options.step) < 1 ? (options.step + '').replace(/^.*\./, '').length : 0;
		self._createSpinner();

		if (iu.tool.type(options.value, 'string|number')) {
			self.val(self.format(self.parse(options.value), true), options.focus);
		}
	},
	destroy : function() {
		var self = this,
			events = self.events,
			element = self.element;

		element
			.unbind('blur', events.correct)
			.unbind('keydown', events.keydown);

		$(document.body).unbind('mouseup', events.mouseup);

		iu.tool.uninput(element, events.correct);
		iu.tool.unmousewheel(document.body, events.mousewheel);

		element.insertBefore(self.spinner);
		self.spinner.remove();
	},
	setOption : function(key, value) {
		var self = this;
		arguments.length == 1 && self.val(self.format(self.parse(key), true));
	},
	spinner : null,
	decimal : 0, // decimal
	focused : false,
	val : function(val, focus) {
		var self = this,
			options, previous,
			element = self.element;

		if (!arguments.length) {
			return element.val();
		}

		options = self.options;
		previous = element.data('iu_spinner_value');
		element.data('iu_spinner_value', val);

		if (val == element.val()) {
			if (iu.tool.type(options.change, 'function') && previous != val) {
				options.change.call(element, val);
			}

			return;
		}

		element.val(val);
		focus && element.focus();

		if (iu.tool.type(options.change, 'function') && previous != val) {
			options.change.call(element, val);
		}
	},
	parsedVal : function() {
		return this.parse(this.element.val());
	},
	to : function(process, continuous) {
		var self = this,
			element = self.element,
			options = self.options,
			val = self.parse(element.val()),
			to, fix_length;

		if (val === '') {
			to = process > 0 ? options.min : options.max;
		} else {
			to = val + options.step * process;

			// float calculate bug
			if ((to + '').indexOf('.') > -1) {
				var reg = /^\d+\./;

				fix_length = Math.max((val + '').replace(reg, '').length, (options.step + '').replace(reg, '').length);

				if (fix_length < (to + '').replace(reg, '').length) {
					to = parseFloat(to.toFixed(fix_length));
				}
			}
		}

		if (to > options.min) {
			if (to > options.max) {
				to = options.loop ? options.min : options.max;
			}
		} else {
			to = options.loop ? options.max : options.min;
		}

		self.val(self.format(to, true));

		continuous && self.delay(function() {
			self.to(process, 1);
		}, 100);
	},
	format : function(val, fix) {
		var self = this, options = self.options;

		val > options.min ? (val > options.max ? val = options.max : 0) : val = options.min;

		if (iu.tool.type(options.format, 'function')) { // custom format
			val = options.format(val);
		} else {
			if (fix && val.toFixed) { // number
				val = val.toFixed(self.decimal);
			}
		}

		// value prefix
		iu.tool.type(options.prefix, 'string') ? val = options.prefix + val : 0;
		// value suffix
		iu.tool.type(options.suffix, 'string') ? val += options.suffix : 0;

		return val;
	},
	parse : function(val) {
		if (val === '') {
			return '';
		}

		var self = this, options = self.options, pos, length, fix;

		val += '';

		fix = options.prefix;
		if (iu.tool.type(fix, 'string')) {
			val.indexOf(fix) ? 0 : val = val.substr(fix.length);
		}

		fix = options.suffix;
		if (iu.tool.type(fix, 'string')) {
			val = val.replace(/\s+$/, '');
			pos = val.lastIndexOf(fix);
			
			(pos > -1 && (pos + fix.length == val.length))
				?
					val = val.substr(0, pos) : 0;
		}

		if (iu.tool.type(options.parse, 'function')) {
			return options.parse(val);
		}

		if (self.decimal) {
			return parseFloat((parseFloat(val) || 0).toFixed(self.decimal));
		}

		return parseInt(val);
	},
	_createSpinner : function() {
		var self = this,
			options = self.options,
			element = self.element,
			events = self.events,
			spinner,
			element_width, width,
			vertical = options.view == 'vertical';

		spinner = $('<span class="iu_spinner">'
						+ '<a class="iu_spinner_down"></a>'
						+ '<a class="iu_spinner_up"></a>'
					+ '</span>');

		vertical && spinner.addClass('iu_spinner_vertical');

		spinner.insertBefore(element);
		spinner.append(element);
		element_width = element.outerWidth(true);

		width = element_width - (parseFloat(spinner.css('padding-left')) || 0) - (parseFloat(spinner.css('padding-right')) || 0);
		spinner.width(width);

		if (vertical) {
			element_width -= spinner.children('a.iu_spinner_up').outerWidth();
		} else {
			element_width -= spinner.children('a.iu_spinner_up').outerWidth() + spinner.children('a.iu_spinner_down').outerWidth();
		}

		element.width(element_width);

		self.spinner = spinner;

		spinner.children('a.iu_spinner_down')
			.bind('mousedown', {process : -1}, events.mousedown)
			.bind('mouseleave', events.mouseleave)
			.bind('mouseenter', {process : -1}, events.mouseenter)
			.bind('selectstart', iu.tool.fail);

		spinner.children('a.iu_spinner_up')
			.bind('mousedown', {process : 1}, events.mousedown)
			.bind('mouseleave', events.mouseleave)
			.bind('mouseenter', {process : 1}, events.mouseenter)
			.bind('selectstart', iu.tool.fail);

		element
			.bind('blur', events.blurfix)
			.bind('focus', events.focus)
			.bind('keydown', events.keydown);

		if (options.correctOnInput) {
			iu.tool.input(element, events.correct);
		}
	},
	events : {
		correct : function(e) {
			var self = this;
			self.val(self.format(self.parse(self.element.val())));
		},
		blurfix : function(e) {
			var self = this;
			self.val(self.format(self.parse(self.element.val()), true));
		},
		focus : function(e) {
			var self = this, events = self.events;

			self.focused = true;

			self.element
				.unbind('focus', events.focus)
				.bind('blur', events.blur);

			iu.tool.mousewheel(document.body, events.mousewheel);
		},
		blur : function(e) {
			var self = this, events = self.events;

			self.focused = false;

			iu.tool.unmousewheel(document.body, events.mousewheel);

			self.element
				.unbind('blur', events.blur)
				.bind('focus', events.focus);
		},
		keydown : function(e) {
			var self = this;
			switch (e.which) {
				case iu.tool.key.UP : {
					self.to(1);
					break;	
				}
				case iu.tool.key.DOWN : {
					self.to(-1);
					break;
				}
				case iu.tool.key.PAGE_UP : {
					self.to(self.options.page);
					break;
				}
				case iu.tool.key.PAGE_DOWN : {
					self.to(-self.options.page);
					break;
				}
				default : {
					return;
				}
			}

			return false;
		},
		mousedown : function(e) {
			if (e.which != 1) {
				return;
			}

			var self = this;

			self.element.focus();
			self.continuous = true;
			self.to(e.data.process);
			self.delay('to', [e.data.process, true], 400);

			$(document.body).bind('mouseup', self.events.mouseup);

			if (self.focused) {
				return false;
			}
		},
		mouseup : function(e) {
			var self = this;

			self.continuous = false;
			self.clear();

			if ($(e.target).parents('span.iu_spinner:eq(0)').length) {
				self.element.focus();
			}

			$(document.body).unbind('mouseup', self.events.mouseup);
		},
		mouseenter : function(e) {
			this.continuous && this.to(e.data.process, true);
		},
		mouseleave : function(e) {
			this.clear();
		},
		mousewheel : function(e) {
			this.to((e.originalEvent.wheelDelta || -e.originalEvent.detail) > 0 ? 1 : -1);
			return false;
		}
	},
	options : {
		step : 1,
		page : 10,
		max : 10000,
		min : 1,
		value : null,
		focus : false, // focus when created
		prefix : null,
		suffix : null,
		view : null, // null|vertical, default -- -input+, vertical -- input±
		decimal : null, // accuracy, null -- calculated according to options.step
		loop : false, // min => max => min => max ...
		format : null, // custom format, function
		parse : null, // custom parse
		correctOnInput : false, // correct while input

		change : null // callback when the value changed
	}
});