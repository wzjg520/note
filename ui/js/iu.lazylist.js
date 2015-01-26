/**
 * iu.lazylist.js
 * performance optimization
 * */
iu.widget('lazylist', {
	init : function() {
		this._createLazyList();
	},
	destroy : function() {
		var self = this;
		self._scroller.unbind('scroll', self.events.scroll);
	},
	setOption : function(key, value) {
		switch (key) {
			case 'width' : {
				this.cols = Math.floor(this.element.width() / value);
				break;
			}
		}
	},
	// lazylist : null, // lazylist dom
	// _middle : null, // lazylist middle dom
	// _inner : null, // lazylist inner
	// _scroller : null, // lazy scroller
	_scroll_counter : 0, // delay scroll event
	_scroll_timer : 0, // delay scroll event timer
	cols : 1,
	update : function(list, to) {
		var self = this,
			cols = self.cols,
			options = self.options,
			limit = options.limit,
			height = options.height,
			scroller = self._scroller,
			start, list_height;

		options.list = iu.tool.type(list, 'array') ? list : list = [];

		if (to == null) {
			to = scroller.scrollTop();
		} else {
			to = Math.floor(to / cols) * height
		}

		scroller.unbind('scroll', self.events.scroll);

		start = Math.floor(to / height / limit) * limit * cols;
		self._update('replace', start, list.slice(start, start + limit * cols * 2), true);

		scroller.scrollTop(to);

		list_height = Math.ceil(list.length / cols) * height;
		options.scrollHandler && self.lazylist.css('height', list_height);
		self._middle.css('min-height', list_height);

		scroller.bind('scroll', self.events.scroll);
	},
	remove : function(index) { if (index > -1) {
		var self = this,
			cols = self.cols,
			options = self.options,
			list = options.list,
			sum = list.length,
			height = options.height,
			item = list.splice(index, 1),
			inner = self._inner,
			inner_top, inner_bottom;

		self._scroller.unbind('scroll', self.events.scroll);

		inner_top = parseInt(inner.css('top')) / height * cols; // inner actual top
		inner_bottom = inner_top + inner.children().length; // inner actual bottom

		inner.children(':eq(' + (index - inner_top) + ')')[options.removeAnimation](function() {
			var list_height = Math.ceil((sum - 1) / cols) * height;
			options.scrollHandler && self.lazylist.css('height', list_height);
			self._middle.css('min-height', list_height);
			$(this).remove();
			self._scroller.bind('scroll', self.events.scroll);
			if (index < inner_top) {
				inner_top--;
				if (cols > 1) {
					self._update('prepend', inner_top, list.slice(inner_top, inner_top + 1));
				} else {
					inner.css('top', inner_top * height);
				}
			} else if (index <= inner_bottom) {
				if (inner_bottom < sum) {
					self._update('append', inner_bottom - 1, list.slice(inner_bottom - 1, inner_bottom));
				}
			}
			iu.tool.type(options.afterremove, 'function') && options.afterremove.call(self, item);
		});
	}},
	resize : function(width) {
		var self = this,
			options = self.options,
			cols;

		width > 0 ? options.width = width : width = options.width;
		cols = self.cols = Math.floor(self.element.width() / width);

		self.update(options.list);
	},
	scrollTo : function(to) {
		to > -1 && this._scroller.scrollTo(Math.floor(to / this.cols) * this.options.height);
	},
	refreshList : function() {
		var self = this,
			cols = self.cols,
			options = self.options,
			height = options.height,
			limit = options.limit,
			list = options.list,
			type, start, end,
			scroller = self._scroller,
			inner = self._inner,
			inner_top, inner_bottom,
			index_top, index_bottom;

		inner_top = parseInt(inner.css('top')) / height * cols; // inner actual top
		inner_bottom = inner_top + inner.children().length; // inner actual bottom

		index_top = scroller.scrollTop() - height;
		index_top > 0 ? 0 : index_top = 0;
		index_top = Math.floor(index_top / height / limit) * limit * cols; // index expect top
		index_bottom = index_top + limit * cols * 2; // index expect bottom
		index_bottom > list.length ? index_bottom = list.length : 0;

		if (index_top < inner_top) {
			// prepend
			if (index_bottom > inner_top) {
				type = 'prepend';
				start = index_top;
				end = inner_top;
			} else {
				type = 'replace';
				start = index_top;
				end = index_bottom;
			}
		} else if (index_bottom > inner_bottom) {
			// append
			if (index_top < inner_bottom) {
				type = 'append';
				start = inner_bottom;
				end = index_bottom;
			} else {
				type = 'replace';
				start = index_top;
				end = index_bottom;
			}
		} else {
			return;
		}

		self._update(type, start, list.slice(start, end));
	},
	_update : function(type, start, list, reset) {
		var self = this,
			options = self.options,
			limit = options.limit,
			cols = self.cols,
			height = options.height,
			sum = options.list.length,
			list_height,
			inner = self._inner,
			inner_children = inner.children(),
			placeholder;

		if (reset) {
			list_height = Math.ceil(sum / cols) * height;
			if (options.scrollHandler) {
				self.lazylist.css('height', list_height || '');
			} else {
				self.lazylist.css('overflow-y', 'auto');
			}
			self.lazylist.css('min-height', '100%');
			self._middle.css('min-height', list_height || '');
		}

		if (sum) {
			self._middle.css('height', '');
			inner.css('height', '');
			switch (type) {
				case 'append' : {
					limit = limit * cols;
					if (inner_children.length > limit * 2 - 1) {
						inner_children.slice(0, limit).remove();
						inner.css('top', (start - limit) * height / cols);
					}
					inner.append(self._createItems(options.formatItem, list, start));
					break;
				}
				case 'prepend' : {
					limit = limit * cols;
					if (inner_children.length > limit * 2 - 1) {
						inner_children.slice(limit).remove();
					}
					inner.css('top', height * start / cols);
					inner.prepend(self._createItems(options.formatItem, list, start));
					break;
				}
				case 'replace' : {
					inner_children.remove();
					inner.css('top', height * start / cols);
					inner.html(self._createItems(options.formatItem, list, start));
					break;
				}
				default : {
					return;
					break;
				}
			}
			iu.tool.type(options.afterrender, 'function') && options.afterrender.call(self);
		} else {
			self._middle.css('height', '100%');
			inner.css('height', '100%');
			placeholder = options.placeholder;
			inner.css('top', 0).html(iu.tool.type(placeholder, 'function') ? placeholder.call(self) : placeholder);
		}
	},
	_createLazyList : function() {
		var self = this,
			element = self.element,
			options = self.options,
			list = options.list,
			height = options.height,
			to = options.scrollTo,
			start,
			limit = options.limit,
			lazylist = $('<div class="iu_lazylist">'
							+ '<div class="iu_lazylist_middle" style="position:relative">'
								+ '<div class="iu_lazylist_inner" style="position:absolute;width:100%"></div>'
							+ '</div>'
						+ '</div>');

		element.children().remove();
		element.append(lazylist);

		iu.tool.type(list, 'array') ? 0 : options.list = list = [];
		height > 0 ? 0 : height = element.height() || 1;
		limit > 0 ? 0 : limit = Math.ceil(element.height() / height * 1.5);

		if (options.width > 0) {
			self.cols = Math.floor(element.width() / options.width);
		}

		options.height = height;
		options.limit = limit;

		limit = limit * self.cols;

		self.lazylist = lazylist;
		self._middle = lazylist.find('.iu_lazylist_middle');
		self._inner = lazylist.find('.iu_lazylist_inner');
		self._scroller = (options.scrollHandler ? $(options.scrollHandler) : lazylist);

		if (to > 0) {
			start = Math.floor(to / limit) * limit;
			self._update('replace', start, list.slice(start, start + limit), true);
			self._scroller.scrollTop(to * height);
		} else {
			self._update('replace', 0, list.slice(0, limit), true);
		}

		self._scroller.bind('scroll', self.events.scroll);
		self._inner.bind('click contextmenu mousedown', self.events.local);
	},
	_createItems : function(format, list, offset) {
		var html = [], i, length, index = offset > 0 ? offset : 0;
		for (i = 0, length = list.length; i < length; i++) {
			// html.push(format(list[i], i + index));
			html.push(format(list[i], i + index).replace(/(<\w+)/, '$1 data-index=' + (i + index) + ' '));
		}
		return html.join('');
	},
	events : {
		local : function(e) {
			var target = $(e.target);
			target.hasClass('iu_lazylist_item') ? 0 : target = target.parents('.iu_lazylist_item');
			if (target.length && this.options[e.type]) {
				return this.options[e.type].call(this, e, target.get(0));
			}
		},
		scroll : function(e) {
			var self = this;

			self._scroll_counter++;
			clearTimeout(self._scroll_timer);

			if (self._scroll_counter > 7) { // counter limit, obtained by actual test
				self._scroll_counter = 0;
				self.refreshList();
			} else {
				self._scroll_timer = setTimeout(function() {
					self.refreshList();
				}, 80);
			}
		}
	},
	options : {
		list : null, // lazylist list data
		limit : null, // lazylist lazy limit
		height : 100, // lazylist item height
		width : null, // lazylist item width, support multi-cols
		scrollTo : 0, // lazylist scroll to the certain item
		scrollHandler : false,
		formatItem : function(item, index) {
			return '<div class="iu_lazylist_item">' + index + '</div>';
		},
		placeholder : null, // function() {return '';}|'', function|string, when list is empty
		removeAnimation : 'slideUp', // slideUp|fadeOut|hide|toggle, animation when the item is removing

		click : null, // function(e, item) {}, callback when list item clicked
		contextmenu : null, // function(e, item) {}, callback when list item contextmenu
		mousedown : null, // function(e, item) {}, callback when list item mousedown
		afterrender : null, //function() {}, callback after list item renderred
		afterremove : null // function() {}, callback after list item removed
	}
});