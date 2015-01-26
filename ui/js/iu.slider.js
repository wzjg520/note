/**
 * iu.slider.js
 * */
iu.widget('slider', {
	init : function(){
		var self = this;
		return self._createSlider();
	},
	_createSlider : function() {
		var self = this,
			options = self.options;

		self.element = (typeof self.element == 'string') ? $(self.element) : self.element;

		var slider = $('<div class="iu_slider">'
						+ '<div class="iu_slider_bar">'
							+ '<div class="iu_slider_range"></div>'
							+ '<div class="iu_slider_handle"></div>'
						+ '</div>'
					+ '</div>');

		var sliderBar = slider.find('.iu_slider_bar');
		self.range = slider.find('.iu_slider_range').css({
															'width' : options.handLeft + 'px',
															'height' : options.barHeight + 'px'
		});

		self.handle = slider.find('.iu_slider_handle').css({
															'left' : options.handLeft + 'px',
															'height' : options.handHeight + 'px',
															'top' : (options.barHeight - options.handHeight) / 2 + 'px'
		});

		options.barHeight = Math.min(options.sliderHeight, options.barHeight);
		options.handHeight = Math.min(options.sliderHeight, options.handHeight);

		sliderBar.css({'width' : options.barWidth + 'px', 
						'height' : options.barHeight + 'px'});

		var btnsmaller = $('<div class="iu_slider_smaller"></div>'),
			btnbigger = $('<div class="iu_slider_bigger"></div>');

		slider.appendTo(self.element);

		var sliderLeft = 0;
		if(options.showBtn) {
			btnsmaller.insertBefore(sliderBar);
			btnbigger.insertBefore(sliderBar);

			btnbigger.bind('click', self.events.clickbigger);
			btnsmaller.bind('click', self.events.clicksmaller);

			sliderLeft += btnsmaller.width();

			btnbigger.css({
							'left' : options.barWidth + sliderLeft + 4 + 'px',
							'top' : (options.sliderHeight - btnsmaller.height()) / 2 + 'px'
			});

			btnsmaller.css({
							'top' : (options.sliderHeight - btnsmaller.height()) / 2 + 'px'
			});
		}

		sliderBar.css({
					'width': options.barWidth + 'px',
					'left' : sliderLeft + 2 + 'px',
					'top' : (options.sliderHeight - options.barHeight) / 2 + 'px'
		});

		slider.css({
					'width' : options.barWidth + sliderLeft * 2 + 4 + 'px',
					'height' : options.sliderHeight + 'px'});

		var bw = sliderBar.width(),
			hw = self.handle.width();

		options.limited = {min : 0, max : bw - hw};

		self.handle.bind('mousedown', self.events.bardown);

		if(options.handLeft > 0 && options.handLeft <= options.barWidth) {
			if(iu.tool.type(options.change, 'function')) {
				options.change(options.handLeft / options.limited.max * options.multiple);
			}
		}
	},
	setProcess : function(len) {
		var self = this;
		self.range.css('width', len);
		self.handle.css('left', len);
	},
	getHandleLeft : function(){
		var self = this;
		return parseInt(self.handle.css('left'));
	},
	events : {
		bardown : function(e) {
			var self = this,
				options = self.options;

			var data = {
				left : self.getHandleLeft(),
				pageX : e.pageX
			}

			$(document).bind('mousemove', data, self.events.bardrag).bind('mouseup', data, self.events.bardrop);
		},
		bardrag : function(e) {
			var self = this,
				options = self.options;

			var d = e.data;
			var len = Math.min(Math.max(e.pageX - d.pageX + d.left, options.limited.min), options.limited.max);

			self.setProcess(len);
			iu.tool.type(options.change, 'function') && options.change(len / options.limited.max * options.multiple, e);
		},
		bardrop : function(e) {
			var self = this,
				options = self.options;

			$(document).unbind('mousemove', self.events.bardrag).unbind('mouseup', self.events.bardrop);
		},
		clickbigger : function(e) {
			var self = this,
				options = self.options,
				barleft = self.getHandleLeft();

			var len = Math.min(options.step * options.limited.max + barleft, options.limited.max);

			self.setProcess(len);
			iu.tool.type(options.change, 'function') && options.change(len / options.limited.max * options.multiple, e);
		},
		clicksmaller : function(e) {
			var self = this,
				options = self.options,
				barleft = self.getHandleLeft();

			var len = Math.max(barleft - options.step * options.limited.max, options.limited.min) ;

			self.setProcess(len);
			iu.tool.type(options.change, 'function') && options.change(len / options.limited.max * options.multiple, e);
		}
	},
	options : {
		sliderHeight : 30,
		barWidth : 300,
		handLeft : 0,
		barHeight : 5,
		handHeight : 15,
		step : 0.1,
		multiple : 1,
		showBtn : false,
		change : function() {}
	}
});