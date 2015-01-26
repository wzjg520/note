/**
 * iu.unit.js
 *
 * iu.unit 是一款单元测工具, 详见 demo
 * */
iu.unit = function() {
	function unit(name, expect, act, description) {
		var assert = new Assert(name);
		if (unit.isFunction(expect)) {
			expect(assert);
		} else {
			assert.equal(expect, unit.isFunction(act) ? act() : act, description);
		}
		assert.start();
	}

	unit.async = function(name, suite) {
		var assert = new Assert(name);
		if (unit.isFunction(suite)) {
			suite(assert);
		}
		return assert;
	};

	unit.start = function(name) {
		var assert = new Assert(name);
		if (unit.isFunction(assert.start)) assert.start();
	};

	var map_assert = {length : 0};

	this.map_assert = map_assert;

	function Assert(name) {
		var assert = map_assert[name];
		if (assert instanceof Assert) {
			return assert;
		}
		this.id = map_assert.length++;
		this.name = name;
		this.queue = [];
		map_assert[name] = this;
	}

	Assert.prototype = {
		ok : function(act, description) {
			this.queue.push(['ok', act, !!act, description, 1, trace()]);
		},
		equal : function(expect, act, description) {
			this.queue.push([expect, act, expect == act, description, 1, trace()]);
		},
		notEqual : function(expect, act, description) {
			this.queue.push([expect, act, expect != act, description, 1, trace()]);
		},
		deepEqual : function(expect, act, description) {
			if (expect === act) {
				this.queue.push([expect, act, true, description, 1, trace()]);
			} else {
				this.queue.push([expect, act, deepEqual(expect, act), description, 1, trace()]);
			}
		},
		notDeepEqual : function(expect, act, description) {
			if (expect != act) {
				this.queue.push([expect, act, true, description, 1, trace()]);
			} else {
				this.queue.push([expect, act, !deepEqual(expect, act), description, 1, trace()]);
			}
		},
		strictEqual : function(expect, act, description) {
			this.queue.push([expect, act, expect === act, description, 1, trace()]);
		},
		notStrictEqual : function(expect, act, description) {
			this.queue.push([expect, act, expect !== act, description, 1, trace()]);
		},
		start : function() {
			unit.log(this);
		}
	};

	function deepEqual(a, b) {
		var m = is(a),
			n = is(b),
			i;

		if (m == n) {
			if ({
				'boolean' : 1,
				'function' : 1,
				'number' : 1,
				'null' : 1,
				'string' : 1,
				'undefined' : 1
			}[m]) {
				return a == b;
			} else {
				for (i in a) {
					if (!deepEqual(a[i], b[i])) {
						return false;
					}
				}
				for (i in b) {
					if (!deepEqual(a[i], b[i])) {
						return false;
					}
				}
				return true;
			}
		} else {
			return false;
		}
	}

	var reg_trace = /^\s*at trace/,
		reg_function = new RegExp('^\\s*at Function\\.' + unit.name),
		reg_assert = new RegExp('^\\s*at \\w+\\.'
									+ Assert.name + '\\.'
									+ 'ok|equal|notEqual|deepEqual|notEqual|strictEqual|notStrictEqual');

	function trace(offset) {
		var stack,
			trace = [],
			i,
			length,
			item;

		try {
			throw new Error();
		} catch (e) {
			stack = e.stack.split(/\n/).slice(1);
			for (i = 0, length = stack.length; i < length; i++) {
				item = stack[i];
				if (reg_trace.test(item)) {
					continue;
				} else if (reg_function.test(item)) {
					continue;
				} else if (reg_assert.test(item)) {
					continue;
				}
				trace.push(item);
			}
		}
		return trace;
	}

	var core_toString = {}.toString;

	function is(a) {
		var t = typeof a;
		// object
		if (t.charAt(0) == 'o') {
			if (null === a) {
				return 'null';
			}
			t = core_toString.call(a).slice(8, -1).toLowerCase();
		}
		// boolean, function, number, string, undefined
		return t;
	}

	[[], !0, function() {}, 0, {}, /0/, ''].forEach(function(item, i) {
		var type = core_toString.call(item).split(' ')[1].slice(0, -1);
		unit['is' + type] = function(a) {
			return core_toString.call(a).indexOf(type) > 0;
		};
	});

	(function() {
		var unit_log,
			unit_sum,
			unit_passed,
			unit_failed,
			unit_body;

		unit.log = function(assert) {
			var node;

			if (!unit_log) {
				unit_log = document.createElement('div');
				document.body.appendChild(unit_log);

				unit_log.className = 'iu_unit';
				unit_log.innerHTML = '<div class="iu_unit_head">'
										+ '<div class="iu_unit_ua">' + navigator.userAgent + '</div>'
										+ '<div class="iu_unit_total">'
											+ 'Tests completed'
											+ ' <b>'
												+ '<i class="iu_unit_sum"></i>'
												+ '('
												+ '<i class="iu_unit_passed" title="Passed"></i>'
												+ ':'
												+ '<i class="iu_unit_failed" title="Failed"></i>'
												+ ')'
											+ '</b>'
										+ '</div>'
									+ '</div>'
									+ '<div class="iu_unit_body"></div>';
				node = unit_log.children[0].children[1].children[0];
				unit_sum = node.children[0];
				unit_passed = node.children[1];
				unit_failed = node.children[2];
				unit_body = unit_log.children[1];
			}

			var id = 'iu_unit_suite_' + assert.id,
				suite = document.getElementById(id),
				body,
				subtotal,
				item,
				queue,
				i,
				length;

			if (suite) {
				body = suite.children[1];
				subtotal = suite.getElementsByTagName('i')[1];
			} else {
				suite = document.createElement('div');
				suite.id = id;
				unit_body.appendChild(suite);
				suite.innerHTML = '<div class="iu_unit_suite_head">'
									+ '<i>'
										+ (assert.id + 1) + '. '
										+ str2html(assert.name)
									+ '</i>'
									+ ' <b>(<i class="iu_unit_suite_total"></i>)</b>'
								+ '</div>';
				body = document.createElement('ol');
				body.className = 'iu_unit_suite_body';
				suite.appendChild(body);
				subtotal = suite.getElementsByTagName('i')[1];
			}

			queue = assert.queue;
			for (i = queue.offset || 0, length = queue.length; i < length; i++) {
				item = queue[i];
				node = document.createElement('li');
				body.appendChild(node);
				node.innerHTML = '<i class="' + (item[2] ? 'iu_unit_passed' : 'iu_unit_failed') + '">'
									+ (i + 1) + '. ' + (item[2] ? 'Passed' : 'Failed')
								+ '</i>'
								+ ' <i class="iu_unit_description">' // don't delete the blank
									+ str2html(item[3])
								+ '</i>'
								+ (item[2] ? ''
									: '<div class="iu_unit_detail">'
										+ '<div class="iu_unit_passed">Expect : ' + (unit.isString(item[0]) ? '"' + str2html(item[0]) + '"' : item[0]) + '</div>'
										+ '<div class="iu_unit_failed">Act : ' + (unit.isString(item[1]) ? '"' + str2html(item[1]) + '"' : item[1]) + '</div>'
										+ '<div class="iu_unit_source">Source : '
											+ '<i>' + item[5].join('<br>') + '</i>'
										+ '</div>'
									+ '</div>');
			}
			queue.offset = queue.length;
			subtotal.innerHTML = queue.length;

			// update total
			var j = 0,
				k = 0,
				l = 0,
				name;

			for (name in map_assert) if (map_assert[name] instanceof Assert) {
				queue = map_assert[name].queue;
				for (i = 0, length = queue.length; i < length; i++) {
					j++;
					if (queue[i][2]) {
						k++;
					} else {
						l++;
					}
				}
			}

			unit_sum.innerHTML = j;
			unit_passed.innerHTML = k;
			unit_failed.innerHTML = l;
		};

		function str2html(s) {
			return (s + '').replace(/&/g, '&amp;').replace(/ /g, '&nbsp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		}
	})();

	return unit;
}();