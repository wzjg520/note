/**
 * iu.toast.js, android toast simulator
 * */
iu.widget('toast', {
	init : function(text, duration) {
		var self = this, options = self.options;

		if (null != text) {
			options.text = text;

			if (null != duration) {
				options.duration = duration;
			}
		}

		if (options.text == null) {
			return false;
		}

		self._createToast();
	},
	destroy : function() {
		var self = this, toast = self.toast;

		self.clear();
		toast.fadeOut(function() {
			toast
				.unbind('mousedown,touchstart,click,selectstart,contextmenu', iu.tool.fail)
				.remove();
		});
	},
	_createToast : function() {
		var self = this,
			options = self.options,
			toast,
			width;

		toast = $('<div class="iu_toast" style="position:fixed;display:none"></div>').appendTo(document.body);
		self.toast = toast;

		toast.html(options.text);
		iu.tool.css(toast, options, 'color,backgroundColor,opacity,borderRadius,padding,zIndex');

		toast.css('white-space', 'nowrap');
		width = toast.outerWidth();

		if (width > $(document.body).outerWidth(true)) {
			toast.css('white-space', '');
			width = toast.outerWidth();
		}

		toast
			.css('left', '50%')
			.css('margin-left', - width / 2)
			.bind('mousedown,touchstart,click,selectstart,contextmenu', iu.tool.fail); // prevent toast to get focus

		if (options.vertical == 'bottom') {
			toast.css('bottom', options.bottom);
		} else if (options.vertical == 'middle') {
			toast
				.css('top', '50%')
				.css('margin-top', - toast.outerHeight() / 2);
		} else {
			toast.css('top', options.top);
		}

		toast.fadeIn(function() {
			self.delay(function() {
				self.destroy();
			}, options.duration);
		});
	},
	options : {
		text : null,
		duration : 2000,
		vertical : 'bottom', // top|middle|bottom
		top : 60, // toast top offset if options.vertical is top
		bottom : 60, // toast bottom offset if options.vertical is bottom
		color : '#fff',
		backgroundColor : '#000',
		opacity : 0.5,
		borderRadius : '4px',
		padding : '4px 6px',
		zIndex : null
	}
});