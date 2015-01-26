/**
 * iu.gallery.js
 * */
iu.widget('gallery', {
	init : function() {
		this._createGallery();
	},
	destroy : function() {
		var self = this, events = self.events;
		$(document).unbind('keyup', events.shortcut);
		self.gallery.remove();
	},
	focus : function(thumb, enter_origin) {
		var self = this, prev_focused_thumb, thumbs = self._thumbs.children();

		if (thumb.attr) {
			index = thumb.attr('data-index');
		} else {
			thumb > 0 ? thumb < thumbs.length ? 0 : thumb = thumbs.length - 1 : thumb = 0;
			index = thumb;
			thumb = thumbs.eq(index);
		}

		if (!enter_origin && self._thumbs.css('display') != 'none') {
			self.resize();
			self.refreshThumbs();

			if (thumb.hasClass('iu_gallery_thumb_focus')) {
				return;
			}
		}

		prev_focused_thumb = thumb.siblings('.iu_gallery_thumb_focus').removeClass('iu_gallery_thumb_focus');
		thumb.addClass('iu_gallery_thumb_focus');

		if (self._thumbs.css('display') != 'none') {
			var gallery = self.gallery,
				thumb_height = self.getThumbHeight(),
				scroll_top = gallery.scrollTop(),
				offset_top = parseInt(self.getFocused(true).attr('data-index') / self.getRowCount()) * thumb_height;

			if (offset_top < scroll_top) {
				gallery.scrollTop(offset_top);
			} else if (offset_top + thumb_height > scroll_top + gallery.height()) {
				gallery.scrollTop(offset_top);
			}
		}

		iu.tool.type(self.options.afterthumbchange, 'function') && self.options.afterthumbchange.call(self, thumb, prev_focused_thumb);

		if (enter_origin || self._origin.css('display') != 'none') {
			self.toggleThumbOrigin('origin');
		}
	},
	getFocused : function(thumb) {
		if (thumb) {
			return this._thumbs.children('.iu_gallery_thumb_focus');
		}
		var index = parseInt(this._thumbs.children('.iu_gallery_thumb_focus').attr('data-index'));
		return index > -1 ? index : -1;
	},
	getOrigin : function(origin) {
		if (origin) {
			return this._origin.children();
		}
		return this._origin.find('.iu_gallery_origin_img');
	},
	next : function(number) {
		var self = this, options = self.options;
		if (number == null) {
			number = 1;
		} else if (options.thumbView == 'tile' || options.thumbView == 'bottom' || options.thumbView == 'top') {
			number === true ? number = self.getRowCount() : 0;
		} else {
			number === true ? number = self.getColCount() : 0;
		}
		self.focus(self.getFocused() + number);
	},
	prev : function(number) {
		var self = this, options = self.options;
		if (number == null) {
			number = 1;
		} else if (options.thumbView == 'tile' || options.thumbView == 'bottom' || options.thumbView == 'top') {
			number === true ? number = self.getRowCount() : 0;
		} else {
			number === true ? number = self.getColCount() : 0;
		}
		self.focus(self.getFocused() - number);
	},
	// gallery : null, // gallery dom
	// _inner : null, // gallery inner dom
	// _origin : nuul, // img origin dom
	// _thumbs : null, // img thumbs dom
	push : function(urls, thumbs, index) {
		// push urls and thumbs start from index
		var self = this,
			options = self.options,
			i,
			length = options.urls.length,
			html,
			append;

		if (iu.tool.type(index, 'number')) {
			index > length ? index = length : index < 0 ? index = (index % length) + length : 0;
		} else {
			index = length;
		}

		append = index == length;

		if (iu.tool.type(urls, 'array') && urls.length > 0) {
			iu.tool.type(thumbs, 'array') && thumbs.length == urls.length ? 0 : thumbs = urls.slice(0);
			options.urls.concat(urls);
			options.thumbs.concat(thumbs);
			html = self._createThumbs(options.formatThumb, options.thumbLazyLoad, thumbs, index);

			if (append) {
				self._thumbs.append(html);
			} else {
				self._thumbs.children().slice(index).each(function(nth, thumb) {
					$(thumb).attr('data-index', index + nth);
				}).eq(index).after(html);
			}

			self._thumbs.css('display') == 'none' || self.refreshThumbs();
		}
	},
	remove : function(url/*, b, c*/) {
		// remove urls or thumbs
		var self, options, old_urls, prev_thumb, old_length, img, urls, index, i, length;
		if (iu.tool.type(url, 'array')) {
			urls = url;
		} else {
			urls = [].slice.call(arguments);
		}

		if (length = urls.length) {
			self = this;
			options = self.options;
			old_urls = options.urls;
			old_thumbs = options.thumbs;
			old_length = old_urls.length;

			var getIndex = iu.tool.type(old_urls.indexOf, 'function') ? function(url) {
				var index = old_thumbs.indexOf(url);
				return ~index ? index : old_urls.indexOf(url);
			} : function(url) {
				var i, length;
				for (i = 0, length = old_thumbs.length; i < length; i++) {
					if (old_thumbs[i] == url) {
						return i;
					}
				}
				for (i = 0, length = old_urls.length; i < length; i++) {
					if (old_urls[i] == url) {
						return i;
					}
				}
				return -1;
			};

			for (i = 0; i < length; i++) {
				url = urls[i];
				while (~(index = getIndex(url))) {
					if (index == 0) {
						old_urls.shift();
						old_thumbs.shift();
					} else if (index == old_urls.length - 1) {
						old_urls.pop();
						old_thumbs.pop();
					} else {
						old_urls = old_urls.slice(0, index).concat(old_urls.slice(index + 1));
						old_thumbs = old_thumbs.slice(0, index).concat(old_thumbs.slice(index + 1));
					}
				}
			}

			if (old_length == old_urls.length) {
				return;
			}

			options.urls = old_urls;
			options.thumbs = old_thumbs;

			index = 0;
			self._thumbs.children().each(function(i, thumb) {
				thumb = $(thumb);
				var url = thumb.find('.iu_gallery_thumb_img').attr('data-src');
				if (~(i = getIndex(url))) {
					thumb.attr('data-index', index++);
				} else {
					thumb.hasClass('iu_gallery_thumb_focus') ? thumb.next().length ? thumb.next().addClass('iu_gallery_thumb_focus') : thumb.prev().addClass('iu_gallery_thumb_focus') : 0;
					thumb.remove();
				}
			});

			img = self._origin.find('.iu_gallery_origin_img');
			getIndex(img.attr('data-src')) == -1 && img.removeAttr('data-index');

			self.focus(self.getFocused());
		}
	},
	removeFocused : function() {
		this.remove(this.getFocused(true).find('.iu_gallery_thumb_img').attr('data-src'));
	},
	update : function(urls, thumbs) {
		var self = this,
			options = self.options,
			i,
			index,
			img = self._origin.find('.iu_gallery_origin_img'),
			prev_focused_index = self.getFocused(),
			prev_focused_url = options.thumbs[prev_focused_index];

		iu.tool.type(urls, 'array') ? 0 : urls = [];
		iu.tool.type(thumbs, 'array') ? 0 : thumbs = [];
		thumbs && thumbs.length == urls.length ? 0 : thumbs = urls.slice(0);

		options.urls = urls;
		options.thumbs = thumbs;

		self._thumbs.children().remove();
		self._thumbs.append(self._createThumbs(options.formatThumb, options.thumbLazyLoad, thumbs));

		index = iu.tool.index(thumbs, prev_focused_url);
		index > -1 ? 0 : index = prev_focused_index;
		index > -1 ? index > thumbs.length - 1 ? index = thumbs.length - 1 : 0 : 0;
		i = iu.tool.index(urls, img);
		i == -1 ? img.removeAttr('data-index') : img.attr('data-index', i);

		self.focus(index);
	},
	resize : function() {
		var self = this,
			options = self.options,
			inner_width,
			thumb_width,
			row_width,
			margin;

		if (options.thumbsAlign == 'center') {
			if (options.thumbTileX && options.thumbView == 'tile' && (thumb_width = self.getThumbWidth()) > 0) {
				inner_width = self._inner.width();
				row_width = Math.floor(inner_width / thumb_width) * thumb_width;
				margin = (inner_width - row_width) / 2 - (parseInt(self._thumbs.css('padding-left')) || 0) - (parseInt(self._thumbs.css('padding-right')) || 0);
				self._thumbs.css('margin-left', margin).css('margin-right', margin);
			}
		} else if (options.thumbsAlign == 'left') {
			self._thumbs.css('margin-left', '').css('margin-right', '');
		}
	},
	setOption : function(option, value) {
		var self = this;
		switch (option) {
			case 'thumbsAlign' : {
				self.resize();
				self._thumbs.css('display') == 'none' || self.refreshThumbs();
				break;
			}
		}
	},
	_thumbs_scroll_top : 0,
	_origin_scroll_top : 0,
	// _thumbs_scroll_change : false,
	toggleThumbOrigin : function(view) {
		var self = this,
			options = self.options,
			index = self.getFocused(),
			gallery = self.gallery,
			img,
			origin_changed,
			origin_hide = self._origin.css('display') == 'none',
			toggle = options.thumbView == 'tile' && options.thumbOriginToggle;

		view == null ? view = origin_hide ? 'origin' : 'thumb' : 0;

		if (view == 'origin') {
			img = self._origin.find('.iu_gallery_origin_img');
			if (origin_changed = (img.attr('data-index') != index)) {
				(img = img.get(0)) ? img.onload = img.onerror = iu.tool.noop : 0;
				self._origin.html(options.formatOrigin(options.urls[index], index)
									.replace(/(<\w+)/, '$1 data-index=' + index + ' ')
									.replace(/(<img.*) (class=.*iu_gallery_origin_img)/, '$1 data-src="' + options.urls[index] + '" $2')
								);
				img = self._origin.find('.iu_gallery_origin_img');
			}
			img = img.get(0);

			if (toggle) {
				self._thumbs_scroll_top = gallery.unbind('scroll', self.events.scroll).scrollTop();
				self._thumbs.hide();
			}

			self._thumbs_scroll_change = !origin_hide;

			if (origin_hide) {
				iu.tool.type(options.beforeoriginshow, 'function') && options.beforeoriginshow.call(self, img);
				self._origin.show();
				gallery.scrollTop(self._origin_scroll_top);

				if (toggle) {
					iu.tool.type(options.afteroriginshow, 'function') && options.afteroriginshow.call(self, img);
				}
			}

			if (origin_changed) {
				iu.tool.type(options.afteroriginchange, 'function') && options.afteroriginchange.call(self, img);
				iu.tool.type(options.beforeoriginload, 'function') && options.beforeoriginload.call(self, img);
				iu.tool.type(options.afterorginload, 'function') && (img.onload = function() {options.afterorginload.call(self, img)});
				iu.tool.type(options.afteroriginerror, 'function') && (img.onerror = function() {options.afteroriginerror.call(self, img)});
			}
		} else {
			if (toggle) {
				self._origin_scroll_top = gallery.scrollTop();
				self._origin.hide();
				iu.tool.type(options.beforethumbsshow, 'function') && options.beforethumbsshow.call(self);
				self._thumbs.show();
				switch (options.thumbView) {
					case 'tile' : {
						if (self._thumbs_scroll_change) {
							var thumb_height = self.getThumbHeight(), offset_top = parseInt(self.getFocused(true).attr('data-index') / self.getRowCount() * thumb_height);
							gallery.scrollTop(Math.abs(offset_top - self._thumbs_scroll_top) > thumb_height ? offset_top - thumb_height : self._thumbs_scroll_top);
						} else {
							gallery.scrollTop(self._thumbs_scroll_top);
						}
						break;
					}
					case 'top' : {
						break;
					}
					case 'bottom' : {
						break;
					}
					case 'left' : {
						break;
					}
					case 'right' : {
						break;
					}
				}
				self.resize();
				self.refreshThumbs();
				iu.tool.type(options.afterthumbsshow, 'function') && options.afterthumbsshow.call(self);
				gallery.bind('scroll', self.events.scroll);
			}
		}
	},
	enterFullscreen : function(img) {},
	exitFullscreen : function() {},
	// _thumb_width : null,
	getThumbWidth : function() {
		var self = this, width;
		// effective when options.thumbTileX is true
		if (self._thumb_width == null) {
			width = self._thumbs.children(':eq(0)').outerWidth(true);
			self._thumbs.css('display') == 'none' ? 0 : self._thumb_width = width;
			return width;
		}
		return self._thumb_width;
	},
	// _thumb_height : null,
	getThumbHeight : function() {
		var self = this, height;
		// effective when options.thumbTileY is true
		if (self._thumb_height == null) {
			height = self._thumbs.children(':eq(0)').outerHeight(true);
			self._thumbs.css('display') == 'none' ? self._thumb_height = height : 0;
			return height;
		}
		return self._thumb_height;
	},
	getRowWidth : function() {
		var self = this, inner_width = self._inner.width(), thumb_width = self.getThumbWidth();
		return thumb_width > 0 ? Math.floor(inner_width / thumb_width) * thumb_width : inner_width;
	},
	getRowCount : function() {
		var self = this, thumb_width;
		if (self._thumbs.css('display') == 'none') {
			return 1;
		}
		thumb_width = self.getThumbWidth();
		return thumb_width > 0 ? Math.floor(self._inner.width() / thumb_width) : 0;
	},
	getColHeight : function() {
		var self = this, inner_height = self._inner.height(), thumb_height = self.getThumbHeight();
		return thumb_height > 0 ? Math.floor(inner_height / thumb_height) * thumb_height : inner_height;
	},
	getColCount : function() {
		var self = this, thumb_height;
		if (self._thumbs.css('display') == 'none') {
			return 1;
		}
		thumb_height = self.getThumbHeight();
		return thumb_height > 0 ? Math.floor(self.gallery.height() / thumb_height) : 0;
	},
	isOpenOrigin : function() {
		return this._origin.css('display') != 'none';
	},
	isOpenThumbs : function() {
		return this._thumbs.css('display') != 'none';
	},
	refreshThumbs : function() {
		var self = this,
			options = self.options,
			gallery = self.gallery,
			thumbs,
			gallery_scroll_top, gallery_width, gallery_height,
			thumb_width, thumb_height, row_count,
			start, end;

		switch (options.thumbView) {
			case 'tile' : {
				gallery_scroll_top = gallery.scrollTop();
				gallery_width = gallery.width();
				gallery_height = gallery.height();
				thumb_width = self.getThumbWidth() || gallery_width;
				thumb_height = self.getThumbHeight() || gallery_height;
				row_count = self.getRowCount();

				start = Math.floor(gallery_scroll_top / thumb_height - 1) * row_count;
				end = start + Math.ceil(gallery_height / thumb_height + 2) * row_count;
				start > -1 ? 0 : start = 0;

				thumbs = self._thumbs.children();

				if (options.thumbLazyRelease) {
					// release memory
					thumbs.slice(0, start).find('.iu_gallery_thumb_img').removeAttr('src');
					thumbs.slice(end).find('.iu_gallery_thumb_img').removeAttr('src');
				}

				// show img
				thumbs.slice(start, end).find('.iu_gallery_thumb_img').each(function(index, img) {
					img.src ? 0 : img.src = $(img).attr('data-src');
				});
				break;
			}
			case 'top' : {
				break;
			}
			case 'bottom' : {
				break;
			}
			case 'left' : {
				break;
			}
			case 'right' : {
				break;
			}
		}
	},
	_scroll_counter : 0, // delay scroll event
	_scroll_timer : 0, // delay scroll event timer
	_createGallery : function() {
		var self = this,
			options = self.options,
			element = self.element,
			events = self.events,
			urls = options.urls,
			thumbs = options.thumbs,
			formatThumb = options.formatThumb,
			gallery = $('<div class="iu_gallery">'
							+ '<div class="iu_gallery_inner">'
								+ '<div class="iu_gallery_origin"></div>'
								+ '<div class="iu_gallery_thumbs" style="display:none"></div>'
							+ '</div>'
						+ '</div>').appendTo(element),
			gallery_thumbs = gallery.find('.iu_gallery_thumbs'),
			i,
			length,
			html = '';

		self.gallery = gallery;
		self._inner = gallery.find('.iu_gallery_inner');
		self._thumbs = gallery_thumbs;
		self._origin = gallery.find('.iu_gallery_origin');

		iu.tool.type(urls, 'array') ? 0 : urls = options.urls = [];
		iu.tool.type(thumbs, 'array') ? 0 : thumbs = options.thumbs = [];
		thumbs && thumbs.length == urls.length ? 0 : thumbs = options.thumbs = urls.slice(0);

		options.thumbTileX && gallery_thumbs.addClass('iu_gallery_tile_x');
		options.thumbTileY && gallery_thumbs.addClass('iu_gallery_tile_y');

		switch (options.thumbView) {
			case 'tile' : {
				break;
			}
			case 'top' : {
				break;
			}
			case 'bottom' : {
				break;
			}
			case 'left' : {
				break;
			}
			case 'right' : {
				break;
			}
		}

		gallery.bind('click', events.click);
		options.shortcut && $(document).bind('keyup', events.shortcut);

		if (options.thumbView == 'tile' && options.thumbOriginToggle) {
			gallery.addClass('iu_gallery_toggle');
			if (options.thumbOriginView == 'origin') {
				self._thumbs.hide();
				self._origin.show();
			} else {
				self._origin.hide();
				self._thumbs.show();
			}
		}

		if (options.thumbLazyLoad) {
			gallery.bind('scroll', events.scroll);
		} else {
			self.refreshThumbs = iu.tool.noop;
		}

		gallery_thumbs.append(self._createThumbs(options.formatThumb, options.thumbLazyLoad, thumbs));

		self.focus(options.focus > -1 ? options.focus : 0);
		//self.delay('focus', [options.focus > -1 ? options.focus : 0], 1);
	},
	_createThumbs : function(format, lazy, thumbs, offset) {
		var html = [], i, length, index = offset > 0 ? offset : 0;
		if (lazy) {
			for (i = 0, length = thumbs.length; i < length; i++) {
				html.push(format(thumbs[i], i + index)
							.replace(/(<\w+)/, '$1 data-index=' + (i + index) + ' ')
							.replace(/(<img.*?) src=/gi, '$1 data-src='));
			}
		} else {
			for (i = 0, length = thumbs.length; i < length; i++) {
				html.push(format(thumbs[i], i + index)
							.replace(/(<\w+)/, '$1 data-index=' + (i + index) + ' ')
							.replace(/(<img.*) (class=.*iu_gallery_thumb_img)/, '$1 data-src="' + thumbs[i] + '" $2'));
			}
		}
		return html.join('');
	},
	events : {
		click : function(e) {
			var self = this, target = $(e.target), thumb = target.parents('.iu_gallery_thumb');

			if (thumb.length) {
				self.focus(thumb, self.options.autoToggleOrigin);
			}
		},
		scroll : function(e) {
			var self = this;

			self._scroll_counter++;
			clearTimeout(self._scroll_timer);

			if (self._scroll_counter > 7) { // counter limit, obtained by actual test
				self._scroll_counter = 0;
				self.refreshThumbs();
			} else {
				self._scroll_timer = setTimeout(function() {
					self.refreshThumbs();
				}, 80);
			}
		},
		resize : function(e) {
			this.resize();
		},
		shortcut : function(e) { if (e.target.value === undefined) {
			var self = this, shortcut = self.options.shortcut[e.which];
			shortcut && shortcut.call(self, e);
		}}
	},
	options : {
		urls : null, // img src array
		thumbs : null, // img thumb src array
		formatOrigin : function(url, index) {
			return '<img class="iu_gallery_origin_img" src="' + url + '"/>';
		},
		formatThumb : function(thumb_url, index) {
			return '<a class="iu_gallery_thumb"><img class="iu_gallery_thumb_img" src="' + thumb_url + '"/></a>';
		},
		focus : 0,
		thumbView : 'tile', // tile|top|bottom|left|right, only tile is realised
		thumbLazyLoad : true, // thumb lazy load
		thumbLazyRelease : true, // release invisible thumb
		thumbTileX : true, // tile thumb on the x axis
		thumbTileY : true, // tile thumb on the y axis
		thumbOriginToggle : true, // effective when thumbView is 'tile', toggle thumb view and origin view
		thumbOriginView : 'origin', // effective when thumbView is 'tile', show thumb view or origin view when the gallery is created
		autoToggleOrigin : false, // auto toggle to origin when the click event happens on the thumb
		thumbsAlign : 'center',
		shortcut : {
			'37' : function(e) { // iu.tool.key.LEFT
				this.prev();
			},
			'38' : function(e) { // iu.tool.key.UP
				this.prev(true);
			},
			'39' : function(e) { // iu.tool.key.RIGHT
				this.next();
			},
			'40' : function(e) { // iu.tool.key.DOWN
				this.next(true);
			},
			// exclude iu.tool.key.TAB, because of tabindex
			'13' : function(e) { // iu.tool.key.ENTER
				var self = this;
				if (e.ctrlKey) {
					// todo
					self.enterFullscreen(self.getFocused());
				} else {
					self._thumbs.css('display') == 'none' ? self.toggleThumbOrigin() : self.focus(self.getFocused(), true);
				}
			},
			'27' : function(e) { // iu.tool.key.ESC
				// todo
				this.exitFullscreen();
			}
		},
		fullscreen : true,

		afterfullscreen : null, // callback after fullscreen
		beforefullscreen : null, // callback after fullscreen
		afterthumbsshow : null, // function() {}, callback after show thumbs
		beforethumbsshow : null, // function() {}, callback before show thumbs
		afteroriginshow : null, // function(img){}, callback after show orginal img
		beforeoriginshow : null, // function(img){}, callback before show orginal img
		afterorginload : null, // function(img){}, callback after origin img load
		afteroriginerror : null, // function(img) {}, callback after origin img load error
		beforeoriginload : null, // function(img){}, callback before origin img load
		afterthumbchange : null, // function(current_focused_thumb, prev_focused_thumb) {}, callback when focus change
		afteroriginchange : null // function(img) {}, callback when origin img change
	}
});