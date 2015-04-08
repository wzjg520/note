/**
 * iu.progressbar.js
 * */
iu.widget('progressbar', {
	init : function(value) {
		var self = this;

		value == null ? 0 : self.options.value = value;
		self._createProgressbar();
	},
	destroy : function() {
		this.progressbar.remove();
	},
	// bar : null, // progressbar bar
	// label : null, // progressbar label
	setOption : function(key, value) {
		var self = this;

		if (arguments.length == 1) {
			self.options.view == 'vertical' ? self.bar.css('height', key + '%') : self.bar.css('width', key + '%');
			self.options.label && self.label.html(self._format(key));
		} else {
			switch (key) {
				case 'label' : {
					self.label[(value ? 'removeClass' : 'addClass')]('iu_none');	
					break;
				}
				case 'formatLabel' : {
					if (iu.tool.type(value, 'function')) {
						self._format = value;
					}
					break;
				}
			}
		}
	},
	_format : function(value) {
		return value + '%';
	},
	_createProgressbar : function() {
		var self = this,
			options = self.options,
			progressbar = $('<div class="iu_progressbar">'
							+ '<div class="iu_progressbar_bar"></div>'
							+ '<div class="iu_progressbar_label iu_none"></div>'
						+ '</div>').appendTo(self.element);

		self.progressbar = progressbar;
		self.bar = progressbar.children('div.iu_progressbar_bar');
		self.label = progressbar.children('div.iu_progressbar_label');

		iu.tool.css(progressbar, options, 'width,height');
		options.radius == null || (progressbar.css('border-radius', options.radius), self.bar.css('border-radius', options.border_radius || options.radius));
		options.shadow == null || progressbar.css('box-shadow', options.shadow);
		options.label == true && self.label.removeClass('iu_none');
		options.view == 'vertical' && progressbar.addClass('iu_progressbar_vertical');

		self.setOption(options.value);
	},
	options : {
		value : 0,
		label : true, // show label
		view : 'horizontal', // horizontal|vertical
		formatLabel : null, /*function(value) { // custom format value, show on the label
			// return 'Percent : ' + value
		}*/
		width : null,
		height: null,
		radius : null,
		border_radius: null
	}
});