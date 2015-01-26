/**
 * iu.fullscreen.js
 * */
iu.widget('fullscreen', {
	init : function(active) {
		var self = this, options = self.options;
		active == null ? 0 : options.active = active;
		options.active && self.enter();
	},
	destroy : function() {},
	enter : function() {
		if (!iu.fullscreen.active) {
			var self = this, options = self.options;
			iu.tool.type(options.beforeenter, 'function') && options.beforeenter.call(self);
			iu.fullscreen.enter(this.element[0]);
			iu.tool.type(options.afterenter, 'function') && options.afterenter.call(self);
		}
	},
	exit : function() {
		if (iu.fullscreen.active) {
			var self = this, options = self.options;
			iu.tool.type(options.beforeexit, 'function') && options.beforeexit.call(self);
			iu.fullscreen.exit(this.element[0]);
			iu.tool.type(options.afterexit, 'function') && options.afterexit.call(self);
		}
	},
	setOption : function(key, value) {
		var self = this;
		if (iu.tool.type(key, 'boolean')) {
			value = key;
			key = 'active';
		}
		if (key == 'active') {
			if (value) {
				self.enter();
			} else {
				self.exit();
			}
		}
	},
	options : {
		active : true,
		afterenter : null,
		beforeenter : null,
		afterexit : null,
		beforeexit : null
	}
});
;(function() {
	var fullscreen = iu.fullscreen;

	fullscreen.active = false;
	fullscreen.supported = false;

	iu.tool.each(' webkit moz o ms khtml'.split(' '), function(name) { if (document[name + 'CancelFullScreen']) {
		fullscreen.supported = true;
	
		if (name) {
			fullscreen._enter = name + 'RequestFullScreen';
			fullscreen._exit = name + 'CancelFullScreen';

			if (name == 'webkit') {
				fullscreen._full = 'webkitIsFullScreen';
			} else {
				fullscreen._full = name + 'FullScreen';
			}
		} else {
			fullscreen._enter = 'requestFullScreen';
			fullscreen._exit = 'cancelFullScreen';
			fullscreen._full = 'fullScreen';
		}

		return false;
	}});

	if (fullscreen.supported) {
		fullscreen.enter = function(element) {
			if (element && element[fullscreen._enter]) {
				element[fullscreen._enter]();
				fullscreen.active = true;
			}
		};
		fullscreen.exit = function() {
			if (document[fullscreen._exit]) {
				document[fullscreen._exit]();
				fullscreen.active = false;
			}
		};
		fullscreen.isFull = function() {
			return document[fullscreen._full];
		};
	} else if (!document.domain) {
		fullscreen.enter = function() {
			if (!fullscreen.active) {
				(new ActiveXObject('WScript.Shell')).SendKeys('{F11}');
				fullscreen.active = true;
			}
		};
		fullscreen.exit = function() {
			if (fullscreen.active) {
				(new ActiveXObject('WScript.Shell')).SendKeys('{F11}');
				fullscreen.active = false;
			}
		};
		fullscreen.isFull = function() {
			return fullscreen.active;
		};
	} else {
		fullscreen.enter = fullscreen.exit = fullscreen.isFull = iu.tool.noop;
	}
})();