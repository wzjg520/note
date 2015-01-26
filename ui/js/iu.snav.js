/**
 * iu.snav.js
 * */
iu.widget('snav', {
	init : function(nav) {
		var self = this, options = self.options;

		if (nav && iu.tool.type(nav, 'array')) {
			options.nav = nav;
		}

		self._createSnav(options);
	},
	destroy : function() {
		this.nav.remove();
		$(window).unbind('resize', this.resize);
		$(document.body).unbind('scroll', this.scroll);
	},
	setOption : function(key, value) {
		switch (key) {
			case 'left' : 
			case 'top' : {	
				this.resize();
				break;
			}
		}
	},
	_createSnav : function(options) {
		var self = this,
			nav,
			body = $(document.body),
			win = $(window),
			type = iu.tool.type;

		function build(options, level) {
			var nav, item, i, length, option, text, link;

			if (!type(options, 'array')) {
				return $(options).addClass('iu_snav');
			}

			level ? 0 : level = 0;
			nav = $('<ul class="iu_snav iu_snav_level_' + level + '"></ul>');

			for (i = 0, length = options.length; i < length; i++) {
				option = options[i];

				if (type(option, 'object')) {
					// li
					href = '';
					option.href == null ? 0 : href = ' href="' + option.href + '"';
					option.target ? href += ' target="' + option.target + '"' : 0;

					text = iu.tool.buildText(option);
					item = $('<li class="iu_snav_li' + text.css + '">'
								+ '<a' + href + text.langid + '>' + text.text + '</a>'
							+ '</li>');


					if (option.nav && type(option.nav, 'array')) {
						item.append('<span class="iu_snav_icon_sub"></span>');
						item.append(build(option.nav, level + 1));
					}

				} else if (option == null || type(option, 'string')) {
					// separator
					// null -- default separator
					// string -- separator with class
					item = $('<li class="iu_snav_sep' + (option ? ' ' + option : '') + '"></li>');
				}

				nav.append(item);
			}

			return nav;
		}

		if (self.nav) {
			self.nav.remove();
			win.unbind('resize', self.resize);
		}

		self.nav = nav = build(options.nav);
		body.append(nav);

		nav.find('span.iu_snav_icon_sub').parent().each(function(i, tag) {
			$(tag).bind('click', function(e) {
				if (e.target == tag || $(e.target).parent().get(0) == tag) {
					return false;
				}
			});
		});

		function resize() {
			var refer = $(options.refer);
			refer.length ? 0 : refer = body;

			var offset = refer.offset(),
				left = options.left || 0, top,
				win_height = win.height(),
				nav_height = nav.outerHeight();

			if (options.pos == 'left') {
				left += offset.left;

				if (!options.inside) {
					left -= nav.outerWidth();
				}
			} else {
				left += offset.left + refer.outerWidth();

				if (!options.inside) {
					left -= nav.outerWidth();
				}
			}

			if (options.view == 'fixed') {
				top = options.top;
			} else {
				if (options.top == 'center') {
					top = (win_height - nav_height) / 2;
				} else {
					top = (win_height - nav_height) * 0.318;
					top += (parseFloat(options.top) || 0);
				}
			}

			top > 0 ? 0 : top = 0;

			nav.css('left', left);
			nav.css('top', top);
		}

		win.resize(resize);
		resize();

		self.resize = resize;
	},
	resize : iu.tool.noop,
	scroll : iu.tool.noop,
	options : {
		refer : 'body',
		view : 'fixed', // fixed|auto, style top will be fixed
		pos : 'left', // left|right
		inside : false,
		top : null, // center|auto|number, number offset based on auto
		left : null,
		nav : null /* [
			{
				text : 'text',
				langid : 'id',
				css : 'css',
				hash : '#'
			}
		] */
	}
});