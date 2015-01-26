/**
 * iu.rotate.js, no css
 * suports ie8, rotate angle is only 90,180,270
 * */
iu.widget('rotate', {
	init : function(angle) {
		var self = this;

		angle ? self.options.angle = angle : 0;

		return self.setAngle(self.getAngle());
	},
	desctroy : function() {
		this.restoreStatus();
	},
	storeStatus : function() {
		var self = this,
			status = self.status || (self.status = {}),
			element = self.element,
			style = element[0].style,
			i = 0, edge;

		do {
			edge = self.edges[i];
			status[edge] = parseFloat(element.css('margin-' + edge)) || 0;
			status['s' + edge] = style['margin' + (edge[0]).toUpperCase() + edge.substr(1)];
		} while (++i < 4);

		// margin:auto fix, // ie8
		if (element.css('margin-left') == 'auto' && element.css('margin-right')
			&& (element.css('display') == 'block' || element.parent().children().length == 1)) {

			status.left = status.right = (element.parent().width() - element.width()) / 2;
		}
	},
	restoreStatus : function() {
		var self = this,
			style = self.element[0].style,
			i = 0, edge;

		do {
			edge = self.edges[i];
			style['margin' + (edge[0]).toUpperCase() + edge.substr(1)] = self.status['s' + edge];
		} while (++i < 4);
	},
	loaded : false,
	// store the rotate status
	// status : { top : 0, right : 0, bottom : 0, left : 0},
	edges : ['top', 'right', 'bottom', 'left'],
	getAngle : function() {
		return this.options.angle;
	},
	setOption : function(key, value) {
		switch (key) {
			case 'angle' : {
				this.setAngle(value);
				break;
			}
		}

		if (arguments.length == 1) {
			this.setAngle(key);
		}
	},
	setAngle : function(angle) {
		var self = this,
			callback,
			element = self.element,
			transform = iu.support.transform;

		if (transform) {
			callback = function() {
				element.unbind('load', callback);
				self.status || self.storeStatus();

				self.loaded = true;
				angle = (((Math.round(angle / 90) % 4) + 4) % 4) * 90;
				self[transform == 'filter' ? '_filter' : '_transform'](angle);
				self.status.angle = angle;

				iu.tool.type(self.options.afterrotate, 'function') && self.options.afterrotate.call(element);
			};

			if (/^img$|^i?frame$/i.test(element[0].nodeName) && !self.loaded && (element.width() == 0 || element.height() == 0)) {
				element
					.bind('load', callback)
					.bind('error', function() {
						iu.tool.type(self.options.failload, 'function') && self.options.failload.call(element);
						self.desctroy();
					});
			} else {
				callback();
			}

			return;
		}

		return false;
	},
	// ie
	_filter : function(angle) {
		var self = this,
			status = self.status,
			options, diff, h, v,
			original_width, original_height,
			element = self.element,
			style = element[0].style,
			rotation = angle / 90;

		style.filter = ((style.filter || '').replace(/\bprogid:.*?\)/, ''))
			+ 'progid:DXImageTransform.Microsoft.BasicImage(rotation=' + rotation + ')';

		if ((status.angle === angle) // no update
			|| (status.angle == null && (angle == 0 || angle == 180)) // init
			) {

			return;
		}

		status.angle == null ? status.angle = 0 : 0;

		if (status.angle == 0 || status.angle == 180) {
			if (angle == 90 || angle == 270) {

				options = self.options;
				original_width = element.height();
				original_height = element.width();
				h = options.horizontal;
				v = options.vertical;
				diff = (original_height - original_width);

				if (h == 'left') {
					self._set('right', diff);
				} else if (h == 'center') {
					self._set('left', - diff / 2);
				} else if (h == 'right') {
					self._set('right', diff);
				}

				if (v == 'top') {
					self._set('bottom', - diff);
				} else if (v == 'middle') {
					self._set('top', diff / 2);
					self._set('bottom', - diff / 2);
				} else if (v == 'bottom') {
					self._set('bottom', - diff);
				}
			}
		} else {
			if (angle == 0 || angle == 180) {
				self.restoreStatus();
			}
		}
	},
	// not ie
	_transform : function(angle) {
		var self = this,
			status = self.status,
			options, diff, h, v,
			original_width, original_height,
			element = self.element;

		element.css(iu.support.transform, 'rotate(' + angle + 'deg)');

		if ((status.angle === angle) // no update
			|| (status.angle == null && (angle == 0 || angle == 180)) // init
			) {

			return;
		}

		status.angle == null ? status.angle = 0 : 0;

		if (status.angle == 0 || status.angle == 180) {
			if (angle == 90 || angle == 270) {

				options = self.options;
				original_width = element.width();
				original_height = element.height();
				h = options.horizontal;
				v = options.vertical;
				diff = (original_height - original_width);

				diff /= 2;

				if (h == 'left' || h == 'right') {
					self._set('left', diff);
					self._set('right', diff);
				}

				if (v == 'top') {
					self._set('top', - diff);
					self._set('bottom', - diff);
				} else if (v == 'bottom') {
					self._set('top', - diff);
					self._set('bottom', - diff);
				}
			}
		} else {
			if (angle == 0 || angle == 180) {
				self.restoreStatus();
			}
		}
	},
	_set : function(edge, diff) {
		this.element.css('margin-' + edge, this.status[edge] + diff);
	},
	options : {
		angle : 0,
		vertical : 'middle', // adjust vertical position after rotate, top|middle|bottom
		horizontal : 'center', // adjust horizontal position after rotate, left|center|right

		afterrotate : null, // callback after rotate
		failload : null // img rotate, however the image brokes down
	}
});