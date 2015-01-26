var themes = {
	// dir => theme
	'default' : 'Default',
	'camcard' : 'CamCard',
	'camscanner' : 'CamScanner',
	'openapi' : 'OpenApi',
	'shop' : 'Shop'
};

function getTheme() {
	var theme = location.href.match(/\btheme=(\w+)/i);

	theme = (theme && theme[1] && theme[1].toLowerCase()) || 'default';

	if (themes[theme]) {
		return theme;
	}

	return 'default';
}

function setTheme(theme) {
	theme = (theme + '').toLowerCase();

	if (themes[theme]) {
		location.href = (location.href.replace(/\btheme=\w+/i, '') + '&theme=' + theme).replace('&&', '&').replace('?&', '?').replace(/\.html&/, '.html?');
	}
}

function getCurrentWidgetName() {
	var name = location.href.replace(/^.*\//, '').replace('iu.', '').replace('.html', '').replace(/#.*$/, '').toLowerCase();

	if (name && iu[name]) {
		return name;
	}
}

var css;
(function() {
	// import css
	var style = '', theme = getTheme(), i, length;

	if (!css || !css.unshift) {
		css = [];
	}

	css.unshift('base');

	for (i = 0, length = css.length; i < length; i++) {
		style += '<link rel="stylesheet" type="text/css" href="../theme/' + theme + '/css/iu.' + css[i] + '.css" />';
	}

	$('head').append(style);
})();

$(function() {
	// create theme select
	var select = '<div class="demo_theme"> Theme : '
					+ '<select id="theme_input">';

	for (var key in themes) if (iu.tool.own(themes, key)) {
		select 		+= '<option value="' + key + '">' + themes[key] + '</option>';
	}

	select +=		  '</select>'
				+ '</div>';

	$(document.body).prepend(select);

	$('#theme_input')
		.val(getTheme())
		.bind('change', function() {
			setTheme(this.value);
		});

	// swtich tabs
	$('div.demo').each(function(i, demo) {
		var source, close;

		source = $(demo)
					.append(
						'<div class="demo_source">'
							+ '<div class="source_tabs"><span>Source</span></div>'
							+ '<div class="source_code"></div>'
						+ '</div>')
					.find('div.source_tabs span');

		source.bind('click', function() {
				var demo_source = $(this).parentsUntil('div.demo_source').parent(), code = demo_source.children('div.source_code');

				var autoScroll = function() {
					$(top.document.body).animate({
						scrollTop : source.offset().top - 20
					});
				};

				if (demo_source.data('source')) {
					if (code.css('display') == 'none') {
						code.slideDown(function() {
							resizeIframe();
							autoScroll();
							close.show();
						});
					} else {
						close.hide();

						code.slideUp(function() {
							resizeIframe();
							autoScroll();
						});
					}

					return;
				}

				demo_source.data('source', 1);

				// show source
				var script = (demo_source.prev('script').html() || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

				code.html('<pre language="javascript">'
							+ '<code>'
								+ script.replace(/\s*\n\s+$/, '')//+ script.replace(/\n\t\t/g, '\n').replace(/^\s+|\s+$/g, '')
							+ '</code>'
						+ '</pre>'
						+ '<div class="source_close" title="close"></div>');

				// [].map && hljs.highlightBlock(code.children().get(0));
				code.children().eq(0).snippet('javascript', {style : 'emacs', showNum : false});

				close = code.children('.source_close').bind('click', function() {
					source.trigger('click');
				});

				code.slideDown(function() {
					resizeIframe();
					autoScroll();
					close.show();
				});
			});
	});

	resizeIframe(true);
});

function resizeIframe() {}


if (window != top && top.setIframeHeight) {
	resizeIframe = function(deley) {
		if (deley) {
			setTimeout(function() {
				top.setIframeHeight($(document.body).outerHeight());
			}, 50);
		} else {
			top.setIframeHeight($(document.body).outerHeight());
		}
	}
}