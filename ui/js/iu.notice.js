/**
 * iu.notice.js
 * */
iu.widget('notice', {
	init : function(text, level) {
		var self = this,
			options = self.options;

		text == null ? 0 : options.text = text;
		level == null ? 0 : options.level = level;

		self._createNotice(options);
	},
	destroy : function() {
		$(window).unbind('resize', this.events.resize);
		this.notice.remove();
	},
	show : function() {
		var self = this;
		iu.tool.animateShow(self.notice, self.options.animate);
	},
	hide : function() {
		var self = this, options = self.options;

		iu.tool.animateHide(self.notice, options.animate, function() {
			if (iu.tool.type(options.afterhide, 'function')) {
				options.afterhide.call(self.element);
			}

			self.destroy();
		});
	},
	setOption : function(key, value) { // .notice('Attention Please.', level)
		var self = this;

		switch (key) {
			case 'text' : {
				self._setText(value);
				break;
			}
			case 'level' : {
				self._setLevel(value);
				break;
			}
			case 'autoHide' : {
				self.clear();
				value > 0 && self.delay('hide', value);
				break;
			}
			case 'zIndex' : {
				self.notice.css('z-index', value);
				break;
			}
		}

		if (!(key in self.options)) {
			value == null ? value = iu.notice.options.level : 0;

			// self._setLevel(value);
			value == null || self._setLevel(value);
			self._setText(key);
		}
	},
	_setText : function(text) {
		this.notice.find('span.iu_notice_text').html(text);
	},
	_setLevel : function(level) {
		var self = this;

		self.notice
			.attr('class', 'iu_notice iu_notice_level_' + level)
			.find('span.iu_notice_icon').attr('class', 'iu_notice_icon iu_notice_icon_' + level);

		self.clear();

		if (level && self.options.autoHide > 0) {
			self.delay('hide', self.options.autoHide);
			self.notice.find('a.iu_notice_close').hide();
		} else {
			self.notice.find('a.iu_notice_close').show();
		}
	},
	_createNotice : function(options) {
		var self = this, notice,
			text = iu.tool.buildText(options),
			parent, parent_width, width,
			notice = $('<div class="iu_notice" style="display:none">'
							+ '<span class="iu_notice_icon"></span>'
							+ '<span class="iu_notice_text' + text.css + '"' + text.langid + '>' + text.text + '</span>'
							+ '<a class="iu_notice_close"></a>'
					+ '</div>');

		self.notice = notice;

		if (self.element.css('position') == 'static') {
			notice.appendTo(self.element.offsetParent());
		} else {
			notice.appendTo(self.element);
		}

		options.fill ? options.width = '100%' : 0;
		iu.tool.css(notice, options, 'width,top,zIndex');

		self._setLevel(options.level);

		if (options.align == 'right') {
			notice.css('left', 'auto').css('right', 0);
		} else if (options.align == 'left') {
			notice.css('left', 0);
		} else {
			// align center
			self.events.resize.call(self);
			options.fill && notice.css('border-right', 'none').css('border-left', 'none');
			$(window).bind('resize', self.events.resize);
		}

		notice.find('a.iu_notice_close').bind('click', function() {
			self.hide();
		});

		self.show();
	},
	events : {
		resize : function(e) {
			var self = this,
				notice = self.notice,
				style = notice.get(0).style,
				width = notice.outerWidth(),
				parent = notice.offsetParent(),
				parent_width, left;

			if (iu.tool.none(notice)) {
				opacity = style.opacity;
				
				notice.css('opacity', 0).show();
				parent = notice.offsetParent();
				notice.hide();

				style.opacity = opacity;
				style.filter ? style.filter = null : 0; // bug
			}

			parent_width =
				parent.get(0) == document.body ?
					$(window).width() / 2 + iu.tool.bodyScrollLeft()
					: parent.outerWidth() / 2 + parent.get(0).scrollLeft;

			left = width / 2;
			left = parent_width - left;

			notice.css('left', left);
		}
	},
	options : {
		text : null,
		level : 1, // level = 0 means server message, notice won't hide until user click the close button
		langid : null,
		css : null,
		animate : 'slide', // none|fade|slide
		autoHide : 5000, // used when level != 0
		fill : false,
		align : 'center', // left|center|right
		width : null, // notice width
		top : null,
		zIndex : null,

		afterhide : null // callback, a callback after hide
	}
});