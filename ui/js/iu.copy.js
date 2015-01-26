/**
 * iu.copy.js
 * */
iu.widget('copy', {
	init : function() {
		this._createCopy();
	},
	destroy : function() {},
	// _swf : null,
	setOption : function(key, value) {
		var self = this;
		if (key == 'text') {
			self._swf.setText(value);
		} else if (key == 'title') {
			self.element.attr('title', value);
			self.parent().find('.iu_copy').attr('title', value);
		}
	},
	getText : function() {
		var options = this.options;
		if (text = options.target) {
			text = $(text)[0];
			return text.value == null ? text.innerHTML : text.value;
		}
		return options.text == null ? '' : options.text;
	},
	_createCopy : function() {
		var self = this,
			options = self.options,
			element = self.element,
			id,
			swf,
			wraper;

		if (options.swf) {
			ZeroClipboard.setMoviePath(options.swf);
			self._swf = swf = new ZeroClipboard.Client();

			swf.setHandCursor(element.css('cursor') == 'pointer');

			self._addListener(swf, 'load', 'load');
			self._addListener(swf, 'mouseover', 'mouseenter');
			self._addListener(swf, 'mouseout', 'mouseleave');
			self._addListener(swf, 'mousedown', 'mousedown');
			self._addListener(swf, 'mouseup', 'mouseup');
			self._addListener(swf, 'complete', 'copy');

			id = element.attr('id');
			if (!id) {
				id = 'iu_copy_' + (new Date).getTime();
				element.attr('id', id);
			}

			swf.glue(id, element.offsetParent()[0]);
			options.text == null || self.setOption('text', options.text);
			options.title == null || element.attr('title', options.title);

			wraper = element.parent().find('.iu_copy');
			wraper.attr('title', element.attr('title'));
			if (wraper = wraper[0]) {
				wraper.oniucopycorrect = function() {
					self._correctCopy(true);
				};
			}
		}
	},
	_correctCopy : function(fire) {
		var self = this,
			swf = self._swf,
			element = self.element,
			events = self.events,
			replacer;

		if (swf) {
			swf.destroy();
			self._swf = swf = null;
		}

		element.bind('mouseenter mouseleave mousedown mouseup', events.local);

		if (window.clipboardData) {
			replacer = events.clipboard;
		} else if (window.netscape && self.options.prompt) {
			replacer = events.prompt;
		} else {
			replacer = events.fail;
		}

		element.bind('click', replacer);
		fire && replacer();
	},
	_stopCopy : function(etag, replacer) {
		var self = this, events = self.events;
		replacer = events[replacer ? replacer : 'fail'] || events.fail;
		self.element.bind('click', replacer).unbind('click', events[etag]);
		replacer();
	},
	_addListener : function(dom, etag, handler) {
		var self = this;
		dom.addEventListener(etag, function() {
			if (etag == 'mousedown') {
				self._updateText();
			} else if (etag == 'load') {
				// check flash crash
				if (self._swf && iu.copy.crash) {
					// correct flash copy
					self._correctCopy();
					return;
				}
			}
			var callback = self.options[handler];
			iu.tool.type(callback, 'function') && callback.call(self);
		});
	},
	_updateText : function() {
		this._swf.setText(this.getText());
	},
	events : {
		local : function(e) {
			var self = this, options = self.options, etag = e.type;
			iu.tool.type(options[etag], 'function') && options[etag].call(e);
		},
		clipboard : function() {
			var self = this, copy;
			if (clipboardData.setData('Text', self.getText())) {
				copy = self.options.copy;
				iu.tool.type(copy, 'function') && copy.call(self);
			} else if (self.options.prompt) {
				self._stopCopy('clipboard', 'prompt');
			} else {
				self._stopCopy('clipboard');
			}
		},
		prompt : function() {
			var self = this;
			try {
				prompt(self.options.promptText, self.getText());
			} catch (e) {
				self._stopCopy('prompt');
			}
		},
		fail : function() {
			var fail = this.options.fail;
			iu.tool.type(fail, 'function') && fail.call(this);
		}
	},
	options : {
		swf : null,
		text : null, // text to copy
		target : null, // target to copy, copy text or html, high priority
		title : null,
		prompt : true, // use promt to give a tip
		promptText : 'Ctrl + C',

		load : null,
		mouseenter : null,
		mouseleave : null,
		mousedown : null,
		mouseup : null,
		copy : null, // copy finish
		fail : null // copy fail
	}
});