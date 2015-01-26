/**
 * iu.tabs.js
 * */
iu.widget('tabs', {
	init : function() {
		var self = this, options = self.options;

		self.tabs = $(options.tabs);
		self.contents = $(options.contents);

		self.tabs
			.bind(options.trigger, self.events.change)
			.eq(options.active)
			.trigger(options.trigger);
	},
	destroy : function() {
		this.tabs.unbind(this.options.change, this.events.change);
	},
	tabs : null,
	contents : null,
	setOption : function(key, value) {
		if (key == 'active') {
			this.tabs.eq(value).trigger(this.options.trigger);
		}
	},
	events : {
		change : function(e, tab) {
			tab = $(tab);

			if (tab.hasClass('iu_tab_selected')) {
				return;
			}

			var self = this,
				options = self.options,
				tabs = self.tabs,
				contents = self.contents,
				index, content,
				prev, current,
				prev_tab,
				prev_content,
				prev_index;

			tabs.each(function(i, tab) {
				tab = $(tab);

				if (tab.hasClass('iu_tab_selected')) {
					prev_tab = tab.removeClass('iu_tab_selected').removeClass(options.selected);
					prev_index = iu.tool.index(tabs, tab.get(0));
					prev_content = $(contents[prev_index]);

					return false;
				}
			});

			if (prev_tab == null) {
				prev_tab = $();
				prev_content = $();
				prev_index = -1;
			}

			index = iu.tool.index(tabs, tab[0]);
			content = $(contents[index]);

			prev = {
				tab : prev_tab,
				content : prev_content,
				index : prev_index
			};

			current = {
				tab : tab,
				content : content,
				index : index
			};

			if (iu.tool.type(options.beforechange, 'function') && false === options.beforechange.call(self, prev, current)) {
				return;
			}

			tab.addClass('iu_tab_selected').addClass(options.selected);
			prev_content.hide();
			content.show();

			iu.tool.type(options.afterchange, 'function') && options.afterchange.call(self, current, prev);
		}
	},
	options : {
		tabs : null, // selector|array
		contents : null, // selector|array,
		active : 0, // selected tab when created
		selected : 'selected', // tab selected class
		trigger : 'click', // trigger to change active tab

		beforechange : null, // beforechange(current, to), current = { tab : tab jQuery object, content : content jQuery object, index : tab index}
		afterchange : null // beforechange(current, prev), the same as beforechange
	}
});