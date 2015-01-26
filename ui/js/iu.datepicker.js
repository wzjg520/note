/**
 * iu.datepicker.js
 * pc datepicker
 * */
iu.widget('datepicker', {
	init : function(value) {
		var self = this, options = self.options;

		value ? options.value = value : value = self.element.val();
		value ? options.value = value : 0;

		self.setOption('formatDate', options.formatDate);

		self._createDatepicker();
		options.show && self.show();
	},
	destroy : function() {
		var self = this,
			element = self.element,
			options = self.options,
			events = self.events;

		$(window).unbind('resize', events.resize);
		element.unbind('focus', events.show);
		$(document).unbind('mousedown', events.mousedown);
		options.trigger && $(options.trigger).unbind('click', events.click);

		self.datepicker.remove();
	},
	// datepicker : null, // datepicker jQuery wrapped dom object
	// _stepping : null, // datepicker is stepping
	setOption : function(key, value) {
		switch (key) {
			case 'formatDate' : {
				if (iu.tool.type(this.options.formatDate, 'function')) {
					this._format = this.options.formatDate;
				}

				break;
			}
			default : {
				break;
			}
		}
	},
	today : function() {
		var self = this,
			datepicker = self.datepicker,
			date = new Date,
			year = date.getFullYear(),
			month = date.getMonth() + 1,
			day = date.getDate();

		if (datepicker.find('i.iu_datepicker_year_text').attr('data-year') == year
			&& datepicker.find('i.iu_datepicker_month_text').attr('data-month') == month) {

			datepicker.find('td.iu_datepicker_selected').removeClass('iu_datepicker_selected');
			date = year + '-' + month + '-' + date.getDate();

			datepicker.find('div.iu_datepicker_calendars a').each(function(i, a) {
				if ($(a).attr('data-date') == date) {
					$(a).parent().addClass('iu_datepicker_selected');
					return false;
				}
			});

			self.val(year, month, day);

		} else {
			self.options.value = year + '-' + month + '-' + day;
			self._updateDatepicker(true);
		}

		datepicker.find('td.iu_datepicker_selected a').trigger('click');
		self.element[0].value === undefined || self.element.val(self._value = self.val());
	},
	cancel : function(clear) {
		var self = this;
		if (self.element[0].value === undefined) {
			self.element.html(clear ? '' : self._old);
		} else {
			self.element.val(clear ? '' : self._old);
		}
		self.datepicker.find('td.iu_datepicker_selected').removeClass('iu_datepicker_selected');
	},
	show : function() {
		if (!iu.tool.none(this.datepicker)) {
			return;
		}

		var self = this,
			options = self.options,
			element = self.element,
			events = self.events,
			resize = self.datepicker.css('position') == 'absolute';

		self._old = element.val();
		resize && self.events.resize();

		iu.tool.type(options.beforeshow, 'function') && options.beforeshow.call(self);

		iu.tool.animateShow(self.datepicker, options.animate, function() {
			element
				.unbind('focus', events.show)
				.unbind('click', events.click);

			resize && $(window).bind('resize', events.resize);
			options.inline || $(document).bind('mousedown', events.mousedown);

			iu.tool.type(options.aftershow, 'function') && options.aftershow.call(self);
		}, options.animateDuration);
	},
	hide : function() {
		if (iu.tool.none(this.datepicker)) {
			return;
		}

		var self = this,
			options = self.options,
			element = self.element,
			events = self.events;

		iu.tool.type(options.beforehide, 'function') && options.beforehide.call(self);

		iu.tool.animateHide(self.datepicker, options.animate, function() {
			if (options.timePicker) {
				self._hours.hide();
				self._minutes.hide();
			}

			element
				.bind('focus', events.show)
				.bind('click', events.click);

			$(window).unbind('resize', events.resize);
			$(document).unbind('mousedown', events.mousedown);

			iu.tool.type(options.afterhide, 'function') && options.afterhide.call(self);
		}, options.animateDuration);
	},
	val : function(year, month, date/* or value*/, update) {
		var self = this,
			options = self.options,
			datepicker,
			element,
			value,
			chr;

		if (arguments.length) {
			if (iu.tool.type(month, 'boolean')) {
				update = month;
				month = null;
			}

			if (year.split) {
				year = year.split(/\D+/);
				date = parseInt(year[2]) || null;
				month = parseInt(year[1]) || null;
				year = parseInt(year[0]) || null;
			}

			value = [];
			if (year != null) {
				self._year = year;
				value.push(year);
			}
			if (month != null) {
				self._month = month;
				value.push(month);
			}
			if (date != null) {
				self._date = date;
				value.push(date);
			}

			datepicker = self.datepicker;
			self._value = options.value = value = value.join('-');

			if (datepicker.find('i.iu_datepicker_year_text').attr('data-year') == year
				&& datepicker.find('i.iu_datepicker_month_text').attr('data-month') == month) {

				datepicker.find('td.iu_datepicker_selected').removeClass('iu_datepicker_selected');
				datepicker.find('div.iu_datepicker_calendars a').each(function(i, a) {
					if ($(a).attr('data-date') == value) {
						$(a).parent().addClass('iu_datepicker_selected');
						return false;
					}
				});
			} else if (false != update) {
				self._updateDatepicker(false);
			}

			element = self.element;
			iu.tool.type(options.change, 'function') && options.change.call(self, value);

			if (element[0].value !== undefined) {
				if (options.monthPicker) {
					if (year && month) {
						self.element.val(self._value = self.val());
					}
				} else {
					if (year && month && date) {
						self.element.val(self._value = self.val());
					}
				}
			}
		} else if (self._value) {
			value = '';
			for (var i = 0, length = options.format.length; i < length; i++) {
				chr = options.format.charAt(i);

				switch (chr) {
					case 'Y' : {
						value += self._year;
						break;
					}
					case 'y' : {
						value += self._year.replace(/^../, '');
						break;
					}
					case 'm' : {
						value += (self._month < 10 ? '0' + self._month : self._month);
						break;
					}
					case 'n' : {
						value += self._month;
						break;
					}
					case 'F' : {
						value += options.i18nMonths[self._month - 1];
						break;
					}
					case 'd' : {
						value += (self._date > 0 && self._date < 10 ? '0' + self._date : self._date);
						break;
					}
					case 'j' : {
						value += self._date;
						break;
					}
					case 'D' : {
						date = new Date();
						date.setYear(self._year);
						date.setMonth(self._month - 1);
						date.setDate(self._date);

						value += options.i18nWeekdays[date.getDay() - 1] || options.i18nWeekdays[6];
						break;
					}
					default : {
						value += chr;
						break;
					}
				}
			}

			if (options.timePicker && (chr = self.getTime())) {
				value += ' ' + chr;
			}

			return value;
		}
	},
	next : function() {
		this.step(1);
	},
	prev : function() {
		this.step(-1);
	},
	step : function(step) {
		var self = this,
			options,
			proceed,
			value;

		if (self._stepping) {
			return;
		}

		options = self.options,
		proceed = parseInt(step) || 1;

		switch (options.view) {
			case 'date' : {
				break;
			}
			case 'month' : {
				proceed *= 12;
				break;
			}
			default : {
				proceed *= 12 * 16;
				break;
			}
		}

		value = self._correct(
					parseInt(self.datepicker.find('i.iu_datepicker_year_text:eq(0)').attr('data-year')),
					parseInt(self.datepicker.find('i.iu_datepicker_month_text:eq(0)').attr('data-month')) + proceed * options.months
				);

		options.value = '';
		options.year = value.year;
		options.month = value.month;

		self._updateDatepicker();
	},
	getTime : function() {
		var self = this, time = '', value;
		if (self._hour) {
			value = self._hour.attr('data-hour');
			if (value != null) {
				time = (value < 10 ? '0' + value : value);
				value = self._minute.attr('data-minute');
				if (value != null) {
					time += ':' + (value < 10 ? '0' + value : value);
				}
			}
		}
		return time;
	},
	setTime : function(hour, minute) {
		var self = this, date = new Date, target;

		target = self._hours.find('[data-hour=' + (hour > -1 && hour < 24 ? hour : date.getHours()) + ']').addClass('iu_datepicker_hour_selected');
		target.siblings('.iu_datepicker_hour_selected').removeClass('iu_datepicker_hour_selected');
		self._hour.html(target.html() || '&nbsp;').attr('data-hour', target.attr('data-hour'));

		target = self._minutes.find('[data-minute=' + (minute > -1 && minute < 60 ? minute : date.getMinutes()) + ']').addClass('iu_datepicker_minute_selected');
		target.siblings('.iu_datepicker_minute_selected').removeClass('iu_datepicker_minute_selected');
		self._minute.html(target.html() || '&nbsp;').attr('data-minute', target.attr('data-minute'));
	},
	_year : '', // selected year
	_month : '', // selected month
	_date : '', // selected date
	// _value : '', // selected value : 2012-12-12
	// _hour : '', // selected hour
	// _minute : '', // selected minute
	// _old : '', // old value
	// _hours : null,
	// _minutes : null,
	_createDatepicker : function() {
		var self = this,
			element = self.element,
			options = self.options,
			datepicker;

		self.datepicker = datepicker =
			$('<div class="iu_datepicker">'
				+ '<a class="iu_datepicker_prev"></a><a class="iu_datepicker_next"></a>'
				+ '<div class="iu_datepicker_calendars"></div>'
			+ '</div>')
			.insertAfter(element)
			.bind('click', function(e) {
				var value, target = $(e.target);

				if ('A' == e.target.tagName) {
					if (value = target.attr('data-date')) {
						self.val(value, false);
						options.value = value;

						target = target.parent('td');
						datepicker.find('td.iu_datepicker_selected').removeClass('iu_datepicker_selected');
						target.addClass('iu_datepicker_selected');

						if (element[0].value !== undefined) {
							self._value = value = self.val();

							if (options.inline) {
								// show
								element.val(value).focus();
							} else {
								// hide
								self.hide();
								element.unbind('focus', self.events.show);
								element.val(value).focus();
								element.bind('focus', self.events.show);
							}
						}
					} else if (value = target.attr('data-month')) {
						self.val(value, false);
						options.value = value;

						if (options.monthPicker) {
							target = target.parent('td');
							datepicker.find('td.iu_datepicker_selected').removeClass('iu_datepicker_selected');
							target.addClass('iu_datepicker_selected');

							if (element[0].value !== undefined) {
								self._value = value = self.val();

								if (options.inline) {
									// show
									element.val(value).focus();
								} else {
									// hide
									self.hide();
									element.unbind('focus', self.events.show);
									element.val(value).focus();
									element.bind('focus', self.events.show);
								}
							}
						} else {
							// month view => date view
							options.view = 'date';
							self._updateDatepicker();
						}
					} else if (value = target.attr('data-year')) {
						// year view => month view
						self.val(value, false);
						options.value = value + '-' + (datepicker.find('i.iu_datepicker_month_text').attr('data-month') || self._month);
						options.view = 'month';

						self._updateDatepicker();
					} else if (options.timePicker) {
						if (target.hasClass('iu_datepicker_hour')) {
							self._hours.fadeToggle();
						} else if (target.hasClass('iu_datepicker_minute')) {
							self._minutes.fadeToggle();
						}
					}
				} else if (target.hasClass('iu_datepicker_month') || target.hasClass('iu_datepicker_month_text')) {
					// date view => month view
					value = target.parents('div.iu_datepicker_header');
					value = value.find('i.iu_datepicker_year_text').attr('data-year') + '-' + value.find('i.iu_datepicker_month_text').attr('data-month');

					self.val(value, false);
					options.value = value;
					options.view = 'month';

					self._updateDatepicker();
				} else if ((target.hasClass('iu_datepicker_year') || target.hasClass('iu_datepicker_year_text')) && options.view != 'year') {
					// to year view
					value = target.parents('div.iu_datepicker_header').find('i.iu_datepicker_year_text').attr('data-year')

					self.val(value, false);
					options.value = value;
					options.view = 'year';

					self._updateDatepicker();
				} else if (options.timePicker && 'LI' == e.target.tagName) {
					if (value = target.attr('data-hour')) {
						target.addClass('iu_datepicker_hour_selected').siblings('.iu_datepicker_hour_selected').removeClass('iu_datepicker_hour_selected');
						self._hour.attr('data-hour', value).html(target.html());
						self._hours.fadeOut();
						element.val(self.val());
						iu.tool.type(options.change, 'function') && options.change.call(self, value);
					} else if (value = target.attr('data-minute')) {
						target.addClass('iu_datepicker_minute_selected').siblings('.iu_datepicker_minute_selected').removeClass('iu_datepicker_minute_selected');
						self._minute.attr('data-minute', value).html(target.html());
						self._minutes.fadeOut();
						element.val(self.val());
						iu.tool.type(options.change, 'function') && options.change.call(self, value);
					}
				}
			});

		datepicker.find('a.iu_datepicker_prev').bind('click', function() {
			self.prev();
		});

		datepicker.find('a.iu_datepicker_next').bind('click', function() {
			self.next();
		});

		options.zIndex == null || datepicker.css('zIndex', options.zIndex);

		if (options.inline) {
			datepicker.addClass('iu_datepicker_inline');
		} else {
			element.bind('focus', self.events.show);
		}

		options.buttons && self._createButtons(options.buttons, options.buttonsAlign);
		options.timePicker && self._createTimepicker(options.timePicker, options.buttonsAlign);
		options.trigger && $(options.trigger).bind('click', self.events.click);

		self._updateDatepicker((options.value || (options.year && options.month && options.date) ? true : false));
	},
	_updateDatepicker : function(selected, animate) {
		var self = this,
			datepicker = self.datepicker,
			options = self.options,
			view = options.view,
			date, calendar, calendars, i, length,
			slide, children_length, width,
			current_year, current_month,
			year, month, day,
			hour, minute;

		if (options.value) {
			date = options.value.split(/\D+/);

			year = date[0];
			month = date[1];
			day = date[2];
			hour = parseInt(date[3]);
			minute = parseInt(date[4]);
		} else {
			year = options.year;
			month = options.month;
			day = options.day;
			hour = options.hour;
			minute = options.minute;
		}

		if (options.timePicker && hour > -1 && minute > -1) {
			self.setTime(hour, minute);
		}

		date = new Date;
		date.setDate(1); // fix month overflow, eg 2014-2-30

		year == null || date.setYear(year);
		month == null || date.setMonth(month - 1);
		day == null || date.setDate(day);

		year = date.getFullYear();
		month = date.getMonth() + 1;
		date = date.getDate();

		if (selected) {
			self.val(year, month, date);
			return;
		}

		calendars = datepicker.find('div.iu_datepicker_calendars').stop(true);

		if (animate != false && (children_length = calendars.children().length)) {
			width = datepicker.css('width');
			current_year = parseInt(calendars.find('i.iu_datepicker_year_text').attr('data-year'));
			current_month = parseInt(calendars.find('i.iu_datepicker_month_text').attr('data-month'));

			datepicker.css('width', width);
			calendars.css('width', parseFloat(calendars.css('width')) * 4 + 1);

			if (year < current_year || (year == current_year && month < current_month)) {
				// prepend
				slide = 1;
				calendars.css('left', '-' + width);

				for (i = options.months - 1; i > -1; i--) {					
					if (options.view == 'date') {
						calendar = self._createDateView(year, month + i, date);
					} else if (options.view == 'month') {
						calendar = self._createMonthView(year + i, month);
					} else {
						calendar = self._createYearView(year + i * 16, month);
					}

					calendars.prepend(calendar);
				}

				self._stepping = true;
				calendars.animate({
					left : 0
				}, function() {
					self._stepping = false;
					datepicker.css('width', '');
					calendars.css('left', '').css('width', '');
					calendars.children('div.iu_datepicker_calendar:gt(' + (options.months - 1) + ')').remove();
				});
			} else {
				// append
				slide = -1;

				for (i = 0; i < options.months; i++) {
					if (options.view == 'date') {
						calendar = self._createDateView(year, month + i, date);
					} else if (options.view == 'month') {
						calendar = self._createMonthView(year + i, month);
					} else {
						calendar = self._createYearView(year + i * 16, month);
					}

					calendars.append(calendar);
				}

				self._stepping = true;
				calendars.animate({
					left : '-' + width
				}, function() {
					self._stepping = false;
					datepicker.css('width', '');
					calendars.css('left', '').css('width', '');
					calendars.children('div.iu_datepicker_calendar:lt(' + children_length + ')').remove();
					calendars.children('div.iu_datepicker_calendar:eq(0)').removeClass('iu_datepicker_border_left');
					calendars.children('div.iu_datepicker_calendar:gt(0)').addClass('iu_datepicker_border_left');
				});
			}
		} else {
			calendars.children().remove();

			for (i = 0; i < options.months; i++) {
				if (options.view == 'date') {
					calendar = self._createDateView(year, month + i, date);
				} else if (options.view == 'month') {
					calendar = self._createMonthView(year + i, month);
				} else {
					calendar = self._createYearView(year + i * 16, month);
				}

				calendars.append(calendar);
			}
		}

		calendars.children('div.iu_datepicker_calendar:gt(0)').addClass('iu_datepicker_border_left');

		iu.tool.mousewheel(datepicker.find('table.iu_datepicker_body'), function(e) {
			(e.originalEvent.wheelDelta || -e.originalEvent.detail) > 0 ? self.prev() : self.next();
			return false;
		});
	},
	_createYearView : function(year, month) {
		var self = this,
			options = self.options,
			value = self._correct(year, month),
			html, str, i, length,
			index, border, date, dates,
			sunday, saturday, klass, flag,
			min, max,
			current_month,
			tmp_date = new Date,
			now_year = tmp_date.getFullYear(),
			start, end;

		year = value.year;
		start = parseInt(year / 16) * 16;
		end = start + 16;

		tmp_date.setDate(1);
		tmp_date.setMonth(month);

		// min date
		if (options.minDate) {
			min = new Date;
			min.setHours(0);
			min.setMinutes(0);
			min.setSeconds(0);

			if (options.minDate !== true) {
				str = options.minDate.split(/\D+/);
				str[0] && min.setYear(str[0]);
				str[2] && min.setDate(str[2]);
				str[1] && min.setMonth(parseInt(str[1]) - 1);
			}

			min = min.getTime();
		}

		// max date
		if (options.maxDate) {
			max = new Date;
			max.setHours(23);
			max.setMinutes(59);
			max.setSeconds(59);

			if (options.maxDate !== true) {
				str = options.maxDate.split(/\D+/);
				str[0] && max.setYear(str[0]);
				str[2] && max.setDate(str[2]);
				str[1] && max.setMonth(parseInt(str[1]) - 1);
			}

			max = max.getTime();
		}

		// create frame
		html = '<div class="iu_datepicker_calendar iu_datepicker_yearview">';

		// create header
		html += '<div class="iu_datepicker_header">';
			html += '<span class="iu_datepicker_year">';
				html += '<i class="iu_datepicker_year_text" data-year="' + year + '">' + start + ' - ' + end + '</i>';
			html += '</span>';
			html += '<span class="iu_datepicker_month">';
				html += '<i class="iu_datepicker_month_text" data-month="' + month + '"></i>';
			html += '</span>';
		html += '</div>';

		// create body
		html += '<table class="iu_datepicker_body">';
			for (i = start; i < end; i++) {
				index = i % 4;

				klass = [];
				flag = 1;

				if (i == now_year) {
					klass.push('iu_datepicker_today');
					flag = 0;
				} else {
					if (min) {
						tmp_date.setYear(i);

						if (min > tmp_date.getTime()) {
							klass.push('iu_datepicker_disabled');
							flag = -1;
						}
					}

					if (!klass.length && max) {
						tmp_date.setYear(i);

						if (max < tmp_date.getTime()) {
							klass.push('iu_datepicker_disabled');
							flag = -1;
						}							
					}
				}

				if (i == self._year) {
					klass.push('iu_datepicker_selected');
				}

				klass.length ? klass = ' class="' + klass.join(' ') + '"' : 0;

				str = '<td' + klass + '><a data-year="' + i + '">' + i + '</a></td>';

				if (index) {
					if (index == 4) {
						html += str + '</tr>';
					} else {
						html += str;
					}
				} else {
					html += '<tr>' + str;
				}
			}

		html += '</table>';
		// body end

		// frame end
		html += '</div>';

		return html;
	},
	_createMonthView : function(year, month) {
		var self = this,
			options = self.options,
			value = self._correct(year, month),
			html, str, i, length,
			index, border, date, dates,
			sunday, saturday, klass, flag,
			min, max,
			current_month,
			tmp_date = new Date,
			now_year = tmp_date.getFullYear(),
			now_month = tmp_date.getMonth() + 1;

		year = value.year;
		month = current_month = value.month;

		tmp_date.setDate(1);

		// min date
		if (options.minDate) {
			min = new Date;
			min.setHours(0);
			min.setMinutes(0);
			min.setSeconds(0);

			if (options.minDate !== true) {
				str = options.minDate.split(/\D+/);
				str[0] && min.setYear(str[0]);
				str[2] && min.setDate(str[2]);
				str[1] && min.setMonth(parseInt(str[1]) - 1);
			}

			min = min.getTime();
		}

		// max date
		if (options.maxDate) {
			max = new Date;
			max.setHours(23);
			max.setMinutes(59);
			max.setSeconds(59);

			if (options.maxDate !== true) {
				str = options.maxDate.split(/\D+/);
				str[0] && max.setYear(str[0]);
				str[2] && max.setDate(str[2]);
				str[1] && max.setMonth(parseInt(str[1]) - 1);
			}

			max = max.getTime();
		}

		// create frame
		html = '<div class="iu_datepicker_calendar iu_datepicker_monthview">';

		// create header
		html += '<div class="iu_datepicker_header">';
			html += '<span class="iu_datepicker_year">';
				html += '<i class="iu_datepicker_year_text" data-year="' + year + '">' + year + options.i18nYear + '</i>';
			html += '</span>';
			html += '<span class="iu_datepicker_month">';
				html += '<i class="iu_datepicker_month_text" data-month="' + month + '"></i>';
			html += '</span>';
		html += '</div>';

		// create body
		html += '<table class="iu_datepicker_body">';
			for (i = 0; i < 12; i++) {
				index = i % 4;
				month = i + 1;

				klass = [];
				flag = 1;

				if (year == now_year && month == now_month) {
					klass.push('iu_datepicker_today');
					flag = 0;
				} else {
					if (min) {
						tmp_date.setYear(year);
						tmp_date.setMonth(i);

						if (min > tmp_date.getTime()) {
							klass.push('iu_datepicker_disabled');
							flag = -1;
						}
					}

					if (!klass.length && max) {
						tmp_date.setYear(year);
						tmp_date.setMonth(i);

						if (max < tmp_date.getTime()) {
							klass.push('iu_datepicker_disabled');
							flag = -1;
						}							
					}
				}

				if (year == self._year && month == self._month) {
					klass.push('iu_datepicker_selected');
				}

				klass.length ? klass = ' class="' + klass.join(' ') + '"' : 0;

				str = '<td' + klass + '><a data-month="' + year + '-' + month + '">' + options.i18nMonths[i] + '</a></td>';

				if (index) {
					if (index == 3) {
						html += str + '</tr>';
					} else {
						html += str;
					}
				} else {
					html += '<tr>' + str;
				}
			}

		html += '</table>';
		// body end

		// frame end
		html += '</div>';

		return html;
	},
	_createDateView : function(year, month, date) {
		var self = this,
			options = self.options,
			value = self._correct(year, month),
			html, str, i, length,
			index, border, date, dates,
			sunday, saturday, klass, flag,
			min, max,
			current_month,
			tmp_date = new Date,
			now_year = tmp_date.getFullYear(),
			now_month = tmp_date.getMonth() + 1,
			now_date = tmp_date.getDate();

		year = value.year;
		month = current_month = value.month;

		// min date
		if (options.minDate) {
			min = new Date;
			min.setHours(0);
			min.setMinutes(0);
			min.setSeconds(0);

			if (options.minDate !== true) {
				str = options.minDate.split(/\D+/);
				str[0] && min.setYear(str[0]);
				str[2] && min.setDate(str[2]);
				str[1] && min.setMonth(parseInt(str[1]) - 1);
			}

			min = min.getTime();
		}

		// max date
		if (options.maxDate) {
			max = new Date;
			max.setHours(23);
			max.setMinutes(59);
			max.setSeconds(59);

			if (options.maxDate !== true) {
				str = options.maxDate.split(/\D+/);
				str[0] && max.setYear(str[0]);
				str[2] && max.setDate(str[2]);
				str[1] && max.setMonth(parseInt(str[1]) - 1);
			}

			max = max.getTime();
		}

		// create frame
		html = '<div class="iu_datepicker_calendar' + (options.others ? ' iu_datepicker_others' : '') + ' iu_datepicker_dateview">';

			// month thumb
			if (options.thumb) {
				html += '<div class="iu_datepicker_thumb">' + month + '</div>';
			}

		// create header
		html += '<div class="iu_datepicker_header">';
			html += '<span class="iu_datepicker_year">';
				html += '<i class="iu_datepicker_year_text" data-year="' + year + '">' + year + options.i18nYear + '</i>';
			html += '</span>';
			html += '<span class="iu_datepicker_month">';
				html += '<i class="iu_datepicker_month_text" data-month="' + month + '">' + options.i18nMonths[month - 1] + '</i>';
			html += '</span>';
		html += '</div>';

		// create body
		html += '<table class="iu_datepicker_body">';

			// get border
			border = getBorder(year, month);
			dates = new Array(42);

			// other month
			if (options.others) {
				border.start ? 0 : border.start = 7;
				for (i = 0, length = border.start; i < length; i++) {
					dates[i] = border.prev - length + i + 1;
				}

				index = 1;
				for (i = 0, length = 42 - border.start - border.max; i < length; i++) {
					dates[border.start + border.max + i] = index++;
				}
			}

			// the month
			index = 1;
			for (i = border.start, length = i + border.max; i < length; i++) {
				dates[i] = index++;
			}

			// weekend
			sunday = ((7 - options.start) % 7 + 7) % 7;
			saturday = (sunday + 6) % 7;

			// create weekdays
			html += '<tr class="iu_datepicker_title">';

			index = 0;
			for (i = Math.abs(parseInt(options.start) - 1 || 0), length = 7 + i; i < length; i++) {
				klass = index == sunday || index == saturday ? ' class="iu_datepicker_weekend"' : '';
				index++;

				html += '<td' + klass + '>' + options.i18nWeekdays[i % 7] + '</td>';
			}
			html += '</tr>';
			// weekdays end

			// create days
			month--;
			for (i = 0, length = dates.length; i < length; i++) {
				index = i % 7;

				if (date = dates[i]) {
					if (date == 1) {
						month++;

						if (month == 13) {
							month = 1;
							year++;
						}
					}

					klass = [];
					flag = 1;

					if (year == now_year && month == now_month && date == now_date) {
						klass.push('iu_datepicker_today');
						flag = 0;
					} else {
						if (min) {
							tmp_date.setYear(year);
							tmp_date.setMonth(month - 1);
							tmp_date.setDate(date);

							if (min > tmp_date.getTime()) {
								klass.push('iu_datepicker_disabled');
								flag = -1;
							}
						}

						if (!klass.length && max) {
							tmp_date.setYear(year);
							tmp_date.setMonth(month - 1);
							tmp_date.setDate(date);

							if (max < tmp_date.getTime()) {
								klass.push('iu_datepicker_disabled');
								flag = -1;
							}							
						}
					}

					month == current_month || klass.push('iu_datepicker_other');

					if (index == sunday || index == saturday) {
						klass.push('iu_datepicker_weekend');
					}

					if (year == self._year && month == self._month && date == self._date) {
						klass.push('iu_datepicker_selected');
					}

					klass.length ? klass = ' class="' + klass.join(' ') + '"' : 0;

					str = '<td' + klass + '><a data-date="' + year + '-' + month + '-' + date + '">' + self._format(year, month, date, flag) + '</a></td>';
				} else {
					str = '<td></td>';
				}

				if (index) {
					if (index == 6) {
						html += str + '</tr>';
					} else {
						html += str;
					}
				} else {
					html += '<tr>' + str;
				}
			}
			// days end

		html += '</table>';
		// body end

		// frame end
		html += '</div>';

		return html;

		function getBorder(year, month) {
			var prev, start, max = 31, next,
				date = new Date,
				maxs = [31, 30, 29, 28], i;

			// get start
			date.setDate(1);
			date.setYear(year);
			date.setMonth(--month);

			start = date.getDay() - options.start % 7;
			start < 0 ? start += 7 : 0;

			// get max
			i = 0;
			do {
				date.setDate(maxs[i]);

				if (date.getMonth() == month) {
					max = maxs[i];
					break;
				}

				date.setDate(1);
				date.setMonth(month);

			} while (maxs[++i]);

			// get prev
			date.setDate(1);
			date.setMonth(--month);
			month < 0 ? month = 11 : 0;

			i = 0;
			do {
				date.setDate(maxs[i]);

				if (date.getMonth() == month) {
					prev = maxs[i];
					break;
				}

				date.setDate(1);
				date.setMonth(month);

			} while (maxs[++i]);

			return {
				prev : prev,
				start : start,
				max : max
			}
		}
	},
	_createButtons : function(option, align) {
		var self = this,
			i, key, length,
			text, button, item;

		self.datepicker.find('div.iu_datepicker_buttons').remove();

		if (false === option) {
			return;
		}

		container = $('<div class="iu_datepicker_buttons"></div>').appendTo(self.datepicker);
		align && container.attr('class', 'iu_datepicker_buttons iu_align_' + align);

		if (iu.tool.type(option, 'object')) {
			option = parseObject2Array(option);
		}

		if (!option || !iu.tool.type(option, 'array') || !option.length) {
			return;
		}

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

			for (key in obj) if (iu.tool.own(obj, key)) {
				buttons.push({
					text : key,
					click : obj[key]
				});
			}

			return buttons;
		}

		container.find('a.iu_datepicker_button').remove();
		
		for (i = 0, length = option.length; i < length; i++) {
			item = option[i];
			text = iu.tool.buildText(item);

			if(text.text == '/')
			{
				button = $('<span class="iu_datepicker_button_line"' + text.langid + '>' + text.text + '</span>');
			}
			else
			{
				button = $('<a class="iu_datepicker_button iu_datepicker_button_' + i + text.css + '">'
							+ '<span class="iu_datepicker_button_text"' + text.langid + '>' + text.text + '</span>'
						+ '</a>');
			}

			(function(click) {
				button.bind('click', function(e) {
					false === click.call(self, e, button[0]) || self.hide();
				});
			})(iu.tool.type(item.click, 'function') ? item.click : iu.tool.noop);

			container.append(button);
		}
	},
	_createTimepicker : function(picker, align, hour, minute) {
		var self = this,
			options = self.options,
			datepicker = self.datepicker,
			tmp, hours, minutes,
			i, length, html;

		tmp = options.i18nHour;
		html = '<div class="iu_datepicker_select">';
			html += '<a class="iu_datepicker_hour">&nbsp;</a>';
			html += '<i class="iu_datepicker_select_triangle"></i>';
			html += '<ol class="iu_datepicker_hours">';
			for (i = 0; i < 24; i++) {
				i < 10 ?
					html += '<li data-hour=' + i + '>0' + i + tmp + '</li>'
					: html += '<li data-hour=' + i + '>' + i + tmp + '</li>';
			}
			html += '</ol>';
		html += '</div>';

		tmp = options.i18nMinute;
		html += '<div class="iu_datepicker_select">';
			html += '<a class="iu_datepicker_minute">&nbsp;</a>';
			html += '<i class="iu_datepicker_select_triangle"></i>';
			html += '<ol class="iu_datepicker_minutes">';
			for (i = 0; i < 60; i++) {
				i < 10 ?
					html += '<li data-minute=' + i + '>0' + i + tmp + '</li>'
					: html += '<li data-minute=' + i + '>' + i + tmp + '</li>';
			}
			html += '</ol>';
		html += '</div>';

		datepicker.find('.iu_datepicker_buttons').length || self._createButtons([], align);
		datepicker.find('.iu_datepicker_buttons').prepend(html);

		self._hours = datepicker.find('.iu_datepicker_hours');
		self._minutes = datepicker.find('.iu_datepicker_minutes');
		self._hour = datepicker.find('.iu_datepicker_hour');
		self._minute = datepicker.find('.iu_datepicker_minute');

		options.value || self.setTime(hour, minute);

		$.each([self._hours, self._minutes], function(i, dom) {
			iu.tool.mousewheel(dom, function(e) {
				var self = this, top = self.scrollTop, step = 50;
				if ((e.originalEvent.wheelDelta || -e.originalEvent.detail) < 0) {
					self.scrollTop = top + step;
				} else {
					self.scrollTop = top - step;
				}
				return false;
			});
		});
	},
	_correct : function(year, month) {
		if (month < 1) {
			year = year + parseInt(month / 12) - 1;
			month = 12 + month % 12;
		} else if (month > 12) {
			year = year + parseInt(month / 12);
			month = month % 12;
		}

		return {
			year : year,
			month : month
		}
	},
	_format : function(year, month, date, flag) {
		return date;
	},
	events : {
		show : function() {
			var self = this;

			if (self.datepicker.css('display') != 'none' && self.options.toggle) {
				self.hide();
			} else {
				var value = self.element.val();

				// bug
				if (value && value != self._value) {
					self.options.value = value;
					self._updateDatepicker(true, false);
				}

				self.show();
			}
		},
		resize : function() {
			var self = this,
				element = self.element,
				datepicker = self.datepicker,
				options = self.options,
				position = element.position();

			if (options.position == 'bottom') {
				datepicker.css({'top' : position.top + element.outerHeight() + (parseFloat(element.css('margin-top')) + parseFloat(options.top) || 0), 'bottom':'auto'});
			} else {
				datepicker.css({'bottom' : element.offsetParent().outerHeight() - position.top + (parseFloat(options.top) || 0), 'top' : 'auto'});
			}

			datepicker.css('left', position.left + (parseFloat(element.css('margin-left')) || 0) + parseFloat(options.left));
		},
		click : function() {
			iu.tool.none(this.datepicker) && this.show();
		},
		mousedown : function(e) {
			var self = this;
			self.options.persist || self.options.inline || iu.tool.holdWidget(e, self.element, self.datepicker) || self.hide();
		}
	},
	options : {
		// value : '2013-11-1', // 2012-12-12, high priority
		value : null,
		year : null,
		month : null,
		day : null,
		start : 7, // 1~7 [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
		months : 1,
		view : 'date', // date|month|year view
		monthPicker : false, // pick month other than pick date, which is affected when view is 'month'; set format 'Y-m'
		timePicker : false, // pick time
		position : 'bottom', // top|bottom, default 'bottom', see iu.tip
		trigger : null, // trigger selector : make datepicker visible
		inline : false,
		others : false, // show other dates
		thumb : true,
		show : false,
		persist : false, // blur keep
		toggle : false,
		animate : 'fade', // none|slide|fade
		animateDuration : 200,
		zIndex : null, // datepicker css zIndex
		minDate : null, // true|2012-12-12 min date, disable the day before min date; true means before today
		maxDate : null, // true|2012-12-12 max date, disable the day after max date; true means after today
		formatDate : null, /*function(year, month, date, flag) {
			// custom format date grid content
			// flag -1 -- exceed min date or max date, 0 -- today, 1 -- between min date and max date
		},*/
		format : 'Y-m-d', // y-n-j|F d, Y/Y-m-d, D/... @see php date() format parameter
		buttons : false, // same as dialog buttons
		buttonsAlign : 'right', // left|center|right buttons align
		i18nYear : '年',
		// i18nYear : ' ',
		i18nMonths :'1月,2月,3月,4月,5月,6月,7月,8月,9月,10月,11月,12月'.split(','),
		// i18nMonths : 'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
		i18nWeekdays : '一,二,三,四,五,六,日'.split(','),
		// i18nWeekdays :'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'.split(','),
		i18nDate : '',
		// i18nDate : '号',
		// i18nHour : 'Hour',
		i18nHour : '',
		// i18nMinute : 'Minute',
		i18nMinute : '',

		top : 0,
		left : 0,
		// event callback
		aftershow : null, // callback after show
		beforeshow : null, // callback before show
		afterhide : null, // callback after hide
		beforehide : null, // callback before hide
		change : null/*, function(date) { // callback when the date clicked
			// date example : 2012-12-12
		}*/
	}
});

// <div class="iu_datepicker">
// 	<a class="iu_datepicker_prev">Prev</a>
// 	<a class="iu_datepicker_next">Next</a>
// 	<div class="iu_datepicker_calendars">
// 		<div class="iu_datepicker_calendar">
// 			<div class="iu_datepicker_thumb">8</div>
// 			<div class="iu_datepicker_header"></div>
// 			<table class="iu_datepicker_body">
// 				<tr></tr>
// 			</table>
// 		</div>
// 	</div>
// </div>