/**
 * iu.drag.js
 * */
iu.widget('drag', {
	init : function () {
		// init drag members
		this._createDraggable();
		this.options.disable || this.enable();
	},
	destroy : function() {
		var self = this,
			element = self.element,
			style = element[0].style,
			status = self.status;

		self.disable();
		element.removeClass('iu_drag');

		self.handle[0].style.cursor = status.cursor;
		style.zIndex = status.zIndex;
		style.opacity = status.opacity;
		style.position = status.position;
	},
	// handle : null, // drag handle
	// status : { } // init status, store to recover the drag dom
	// axis : 0,
	// gridX : 1,
	// gridY : 1,
	disabled : false,
	// dragging : false, // the dom is dragging
	disable : function() {
		var self = this;

		self.disabled = true;

		self.dragging = false;
		self.events.stop();

		self.handle
			.unbind(self.etag.start, self.events.start)
			.unbind('dragstart', iu.tool.fail);
	},
	enable : function() {
		var self = this, handle = self.handle;

		self.disabled = false;
		handle.bind(self.etag.start, self.events.start);
		/img/i.test(handle[0].nodeName) && handle.bind('dragstart', iu.tool.fail);
	},
	etag : iu.support.touch ? {
		start : 'touchstart',
		drag  : 'touchmove',
		stop  : 'touchcancel touchend'
	} : {
		start : 'mousedown',
		drag  : 'mousemove',
		stop  : 'mouseup'
	},
	setOption : function(key, value) {
		var self = this;

		switch (key) {
			case 'axis' : {
				this.axis = value == 'x' ? 1 : value == 'y' ? -1 : 0;
				break;
			}
			case 'grid' : {
				if (iu.tool.type(value, 'number')) {
					self.gridX = self.gridY = value;
				} else if (iu.tool.type(value, 'array')) {
					self.gridX = value[0];
					self.gridY = value[1];
				}
			}
		}
	},
	_createHelper : function() {},
	_createDraggable : function() {
		var self = this,
			element = self.element,
			options = self.options,
			style = element[0].style,
			position = self._getPosition(element);
		
		iu.tool.position(element);
		element.addClass('iu_drag');

		if (options.handle) {
			self.handle = element.find(options.handle);
			self.handle.length ? 0 : self.handle = $(options.handle);
		} else {
			self.handle = element;
		}

		self.status = {
			cursor : self.handle[0].style.cursor,
			zIndex : style.zIndex,
			opacity : style.opacity,
			position : style.position,
			// init_top : parseFloat(element.css('top')) || 0,
			// init_left : parseFloat(element.css('left')) || 0,
			init_top : position.top,
			init_left : position.left
		};

		self.setOption('axis', options.axis);
		self.setOption('grid', options.grid);
	},
	_getPosition : function(element) {
		if (element.css('position') == 'relative') {
			return {
				top : parseFloat(element.css('top')) || 0,
				left : parseFloat(element.css('left')) || 0
			};
		}

		return element.position();
	},
	events : {
		start : function(e) { if (e.which == 1 || iu.support.touch) {
			var self = this, options = self.options, callback;

			if (self.dragging) {
				return;
			}

			callback = function() {
				$(document)
					.bind(self.etag.drag, self.events.drag)
					.bind(self.etag.stop, self.events.stop)
					.bind('selectstart', iu.tool.fail);

				var status = self.status,
					element = self.element,
					mouse = iu.tool.getMouse(e),
					position = self._getPosition(element),
					// calculate limit
					limit, limit_offset,
					parent, parent_offset;

				status.top = position.top;
				status.left = position.left;
				status.y = mouse.y - status.top;
				status.x = mouse.x - status.left;

				if (options.limit) {
					limit = $(options.limit);

					if (limit.length) {
						limit_offset = limit.offset();

						parent = element.offsetParent();
						parent_offset = parent.offset();

						if (element.css('position') == 'absolute') {
							// parent_offset.top += (parseFloat(parent.css('border-top-width'))) - (parseFloat(parent.css('padding-top')));
							// parent_offset.left += (parseFloat(parent.css('border-left-width'))) - (parseFloat(parent.css('padding-left')));
								
							parent_offset.top -= (parseFloat(parent.css('padding-top')));
							parent_offset.left -= (parseFloat(parent.css('padding-left')));
						}

						status.min_top = limit_offset.top - parent_offset.top;
						// status.max_top = (limit_offset.top + limit.outerHeight()) - parent_offset.top - element.outerHeight();
						status.max_top = (limit_offset.top + limit.height()) - parent_offset.top - element.outerHeight();
						status.min_left = limit_offset.left - parent_offset.left;
						// status.max_left = (limit_offset.left + limit.outerWidth()) - parent_offset.left - element.outerWidth();
						status.max_left = (limit_offset.left + limit.width()) - parent_offset.left - element.outerWidth();
					}
				}

				if (options.top != null || options.left != null) {
					var offset = iu.tool.getEventOffset(e);

					options.top == null ? 0 : status.y -= offset.y + options.top;
					options.left == null ? 0 : status.x -= offset.x + options.left;
				}
			};

			if (options.delay) {
				self.delay(callback, options.delay);
			} else {
				callback();
			}

			return iu.tool.cancelEvent(e);
		}},
		drag : function(e) {
			var self = this,
				element = self.element,
				options = self.options,
				mouse = iu.tool.getMouse(e),
				status = self.status,
				ret, offset = {
					top : mouse.y - status.y,
					left : mouse.x - status.x
				};

			if (!self.dragging) {
				if (options.distance > 0
						&& Math.abs(offset.top - status.top) < options.distance
						&& Math.abs(offset.left - status.left) < options.distance) {

					return;
				}

				if (options.start) {
					if (false === options.start.call(element, e, offset)) {
						return;
					}
				}

				// drag start
				self.dragging = true;

				options.cursor == null || self.handle.css('cursor', options.cursor);
				options.opacity == null || element.css('opacity', options.opacity);
				options.zIndex == null || element.css('zIndex', options.zIndex);
			}

			self.gridX > 1 ? offset.left = Math.round((offset.left - status.init_left) / self.gridX) * self.gridX : 0;
			self.gridY > 1 ? offset.top = Math.round((offset.top - status.init_top) / self.gridY) * self.gridY : 0;

			if (options.drag) {
				if (false === (ret = options.drag.call(element, e, offset))) {
					return;
				}

				if (ret) {
					ret.top == null ? 0 : offset.top = ret.top;
					ret.left == null ? 0 : offset.left = ret.left;
				}
			}

			if (options.limit) {
				offset.top < status.min_top ? offset.top = status.min_top : offset.top > status.max_top ? offset.top = status.max_top : 0;
				offset.left < status.min_left ? offset.left = status.min_left : offset.left > status.max_left ? offset.left = status.max_left : 0;
			}

			if (self.axis) {
				~self.axis ? element.css('left', offset.left) : element.css('top', offset.top);
			} else {
				element.css('top', offset.top).css('left', offset.left);
			}
		},
		stop : function(e) {
			var self = this, options, status, style, mouse;

			$(document)
				.unbind(self.etag.drag, self.events.drag)
				.unbind(self.etag.stop, self.events.stop)
				.unbind('selectstart', iu.tool.fail);

			if (self.dragging) {
				status = self.status;
				options = self.options;
				style = self.element[0].style;

				self.dragging = false;
				self.handle[0].style.cursor = status.cursor;

				style.opacity = status.opacity;
				style.zIndex = status.zIndex;

				if (options.stop) {
					mouse = iu.tool.getMouse(e);

					options.stop.call(self.element, e, {
						top : mouse.y - status.y,
						left : mouse.x - status.x
					});
				}
			} else {
				self.clear();
			}
		}
	},
	options : {
		limit : null, // drag move limit
		cursor : 'move', // cursor style
		disable : false,
		axis : null, // move axis limit, value is x,y or null
		delay : 0,
		distance : 0,
		handle : null, // drag handle, default the whole dom element
		grid : null, // 1 or [1, 1], // drag grid -> number|[x, y]
		helper : false,
		top : null, // mouse cursor top
		left : null, // mouse cursor left
		opacity : null, // opacity when dragging
		zIndex : null, // zIndex when dragging

		start : null, // function(e, offset) {}, // callback when drag start
		drag  : null, // function(e, offset) {}, // callback while dragging
		stop  : null  // function(e, offset) {}  // callback when drag stop
	}
});