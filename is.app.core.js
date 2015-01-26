/**
 * 该文件分为三部分, 1 基本方法, 2 模块功能, 3 cookie, ajax, validator
 * */

/**
 * test test test test
 * 以下内容向 全局 context 增加属性 ua, head, 函数 Empty, log, hasOwn, isapp
 *
 * 直到 '基本方法结束'
 * */

/**
 * 全局变量 is
 * */
var is = {};

/**
 * 全局变量 isapp;
 * */
var isapp = {};

/**
 * isapp 把全局变量所在环境 this 保存到 isapp.this 中, 在 PC 浏览器中是 window
 * 同时设置版本
 * */
(function() {
	isapp.global = this;
	isapp.version = '0.0.1.a';
})();

/**
 * 全局空函数
 * */
function Empty() {}

/**
 * 日志函数
 * level: 0 msg, 1 warn, 2 error. default 0
 * */
function log(msg/*, level*/) {}

/**
 * 全局变量 ua, 保存浏览器信息
 * ua.name		// 浏览器名称
 * ua.version	// 浏览器版本
 * ua.lang		// 浏览器语言
 * ua.web 		// true => PC 浏览器, false => 手机浏览器
 * ua.wap 		// 服务器端智能通过 userAgent 判断平台展示页面, 而 userAgent 是不准确的, 但有些情况又需要'认为'是 wap 端
 *
 * ua.ie, ua.ie8, ua.chrome, ua.chrome21 ...
 * */
// var ua = {};

/**
 * 浏览器检测
 * */
(function() {
	var ua = {};
	var n = navigator, a = n.appVersion, u = n.userAgent, T = true, F = false, w = this;
	var b, v, l = n.language || n.systemLanguage, web = T, webkit = F;

	ua = {};
	if (w.ActiveXObject || w.msIndexedDB) {
		b = 'ie';
		v = a.match(/MSIE (\d+)\./) ||a.match(/rv:(\d+)\./);
	} else if (w.mozIndexedDB) {
		b = 'ff';
		v = u.match(/Firefox\/(\d+)\./);
	} else if (w.chrome || a.match(/Chrome/)) {
		b = 'ch';
		v = a.match(/Chrome\/(\d+)\./);
		webkit = T;
	} else if (w.opera || /Opera/.test(a)) {
		b = 'op';
		v = u.match(/Version\/(\d+)\./);
	} else if (/Safari/.test(a)) {
		if (/iPad/.test(a)) {
			b = 'ipad';
			web = F;
			webkit = T;
		} else if (/iPhone/.test(a)) {
			b = 'iphone';
			web = F;
			webkit = T;
		} else if (/Android/.test(a)) {
			b = 'android';
			web = F;
		} else {
			b = 'sa';
			webkit = T;
		}
		v = a.match(/Version\/(\d+)\./);
	} else if (/mobile/i.test(a)) {
		web = F;
		webkit = /webkit/i.test(a);
		v = a.match(/(\d+)/); // unknown

		if (/iPad/i.test(a)) {
			b = 'ipad';
		} else if (/iPhone/.test(a)) {
			b = 'iphone';
		} else if (/Android/.test(a)) {
			b = 'android';
		} else if (/Windows Phone/.test(u)){
			b ='wp';
		}
	} else {
		b = 'unknow';
	}

	ua.name = b;
	ua.version = v && v[1] ? parseInt(v[1], 10) : 0;
	ua.web = web;
	ua.webkit = webkit;
	ua.lang = l.toLowerCase();
	ua[b] = ua[b + ua.version] = T;
	// ua.wap = ua.ipad ? F : /android|iphone|blackberry|mobile/i.test(u);
	ua.wap = !/ipad/i.test(u) && /android|iphone|blackberry|mobile/i.test(u);

	ua.os = (function() {
		var na = navigator, ua = na.userAgent, pf = na.platform;

		var win = (/^Win/).test(pf);// == 'Win32' || pf == 'Windows';
		var mac = (/^Mac/).test(pf);// == 'Mac68K' || pf == 'MacPPC' || pf == 'Macintosh' || pf == 'MacIntel';

		if (mac) return 'Mac';
		if (pf == 'X11' && !win && !mac) return 'Unix';
		if (pf.indexOf('Linux') > -1) return 'Linux';

		if (win) {
			// 如果修改了 ua, 目前无法检测
			if (ua.indexOf('Windows NT 5.0') > -1 || ua.indexOf('Windows 2000') > -1) return 'Win2000';
			if (ua.indexOf('Windows NT 5.1') > -1 || ua.indexOf('Windows XP') > -1) return 'WinXP';
			if (ua.indexOf('Windows NT 5.2') > -1 || ua.indexOf('Windows 2003') > -1) return 'Win2003';
			if (ua.indexOf('Windows NT 6.0') > -1 || ua.indexOf('Windows Vista') > -1) return 'WinVista';
			if (ua.indexOf('Windows NT 6.1') > -1 || ua.indexOf('Windows 7') > -1) return 'Win7';
		}

		return pf;
	})();
	this.ua = ua;
})();



/**
 * 初始化日志函数
 * 由于 ie console.log 不支持多个参数, 所以对 log 重新赋值, 同时对 log 扩展方法
 * */
;(function() {
	var logger = isapp.global.console || /*ie6*/ {clear : Empty, log : Empty, warn : Empty, error : Empty}, log_stack = [];

	var levels =['log', 'warn', 'error'], list;

	function format(args) {
		if (isapp.config('debug')) {
			var list = isapp.makeArray(args),
				length = list.length,
				level = list[length - 1],
				v;

			if (typeof level == 'number' && length > 1 && levels[level]) {
				list.pop();
				v = levels[level];
			} else {
				v = levels[0];
			}

			list.v = v;
			list.unshift('[' + v + '] ' + new Date().toLocaleTimeString() + ' -> ');

			return list;
		}

		// logger.clear && logger.clear();
		return false;
	}

	log = ua.ie ? (function () {
		if (list = format(arguments)) {
			logger[list.v](list.shift());
			logger[list.v](list);
		}
	}) : (function () {
		if (list = format(arguments)) {
			logger[list.v].apply(logger, list);
		}
	});

	log.push = function (str) {
		// body...
		var date = new Date, m, s, ms;
		m = date.getMinutes();
		s = date.getSeconds();
		ms = date.getMilliseconds();
		m > 9 ? '' : m = '0' + m;
		s > 9 ? '' : s = '0' + s;
		s = m + ':' + s + '.' + ms;

		log_stack.push([s, [str]]);
	};

	log.output = function () {
		return log_stack;
	};

})();

/**
 * isapp 基础方法
 * */
;(function() {
	var base = isapp;
	var win, doc, head, Conf;

	win = window;
	doc = document;
	head = doc.head || doc.getElementsByTagName('head')[0];

	// compress error
	// var core_arr = [],
	// 	core_slice = core_arr.slice,
	// 	core_obj = {},
	// 	ObjConstructor = core_obj.constructor,
	// 	core_hasOwn = core_obj.hasOwnProperty,
	// 	core_toString = core_obj.toString,
	// 	FnConstructor = Empty.constructor;

	var core_slice = [].slice,
		ObjProto = Object.prototype,
		ObjConstructor = {}.constructor,
		core_hasOwn = ObjProto.hasOwnProperty,
		core_toString = ObjProto.toString,
		FnConstructor = Empty.constructor;

	base.prototype ? base.prototype.author = 'web team' : '';

	/**
	 * 初始化环境
	 *
	 * 用法
	 * 1, script src query => src="is.app.core.js?root=web&debug=true&media=all&charset=utf-8&css_root=css"
	 * 2, base.config({
	 * 		root : 'web',
	 * 		debug : true,
	 * 		media : 'all', // css
	 * 		charset : utf-8,
	 * 		css_root : ''
	 * 	})
	 * base.config or src query are not neccessary
	 * */
	;(function() {
		var i, length, config, root, end, src, query, href = location.href;

		config = {};
		src = doc.getElementsByTagName('script');
		src = src[src.length - 1] || '';
		src = src.src || '';
		end = href.indexOf('?') + 1 || href.indexOf('#');
		end = end > 0 ? href.substr(0, end).lastIndexOf('/') : href.lastIndexOf('/');
		root = href.substr(0, ++end);

		end = src.indexOf('?');
		if (-1 < end) {
			query = src.substr(end + 1).split('&');
			for (i = 0, length = query.length; i < length; i++) {
				query[i] = query[i].split('=');
				config[query[i][0]] = query[i][1];
			}
			src = src.substr(0, end);
			/:\//.test(src) ? '' : src = root + src;
			'root' in config ? '' : root = src.substr(0, src.lastIndexOf('/') + 1);
		} else {
			root = src.substr(0, src.lastIndexOf('/') + 1);
		}
		config.debug = 'debug' in config;
		config.css_root = config.css_root ? /\/$/.test(config.css_root) ? config.css_root : config.css_root + '/' : '';

		Conf = {
			root : root,
			charset : (config.charset || doc.charset || doc.characterSet).toLowerCase(),
			media : config.media || 'all',
			css_root : config.css_root,
			debug : config.debug
		};
	})();

	// 方法开始

	/**
	 * Conf getter and setter
	 * */
	function config(o) {
		return isObj(o) ? addMember(Conf, o) && undefined : o ? Conf[o] : Conf.debug && Conf;
	}

	/**
	 * 对象 obj 是否拥有属性 p
	 * */
	function hasOwn(obj, p) {
		return core_hasOwn.call(obj, p);
	}

	/**
	 * 返回 a 的类型
	 * */
	function type(a) {
		var t = typeof a;

		// object
		if (t.charAt(0) == 'o') { // ie7 charAt
			if (null === a) {
				return 'null';
			}

			t = a.nodeName || core_toString.call(a).slice(8, -1);
			t = t.toLowerCase();
		}

		// function, string, number, boolean, undefined
		return t;
	}

	/**
	 * a 是数组
	 * */
	function isArr(a) {
		return 'array' == type(a);
	}

	/**
	 * a 是函数
	 * */
	function isFn(a) {
		return 'function' == typeof a;
	}

	/**
	 * a 是对象
	 * */
	function isObj(a) {
		return 'object' == type(a);
	}

	/**
	 * 判断空对象
	 * */
	function isEmptyObj(a) {
		for (var i in a) return false;
		return true;
	}

	/**
	 * a 是字符串
	 *
	 * @param Boolean valued, 有值, 且不为空
	 * */
	function isStr(a, valued) {
		return 'string' == typeof a || 'string' == type(a) ? valued ? !!trim(a) : true : false;
	}

	/**
	 * a 是 undefined or null
	 * */
	function isNU(a) {
		return a == undefined;
	}

	/**
	 * a 是 NaN, 但是已经有一个方法 native fuction, isNaN
	 * */
	function isNaN2(a) {
		return a !== undefined && isNaN(a);
	}

	/**
	 * a 是 引用类型
	 * */
	function isRef(a) {
		if (a) {
			var r = false, k = randString(4);
			a[k] = 1;
			r = 1 == a[k];
			delete a[k];
		}
		return r;
	}

	/**
	 * 扩展属性
	 * @param is_array 表明 s 是一个数组或伪数组
	 * */
	function addMember(obj, s, is_array) {
		if (is_array || s instanceof Array) {
			for (var i = 0, length = s.length; i < length; i++) {
				obj[i] = s[i];
			}
		} else {
			for (i in s) {
				hasOwn(s, i) ? obj[i] = s[i] : '';
			}
		}
		return obj;
	}

	/**
	 * 扩展原型
	 * */
	function addProto(obj, s) {
		var i, op = obj && (obj.prototype || obj.constructor.prototype);
		for (i in s) {
			hasOwn(s, i) ? op[i] = s[i] : '';
		}
	}

	/**
	 * 深度复制 arg0,
	 * arg0 不能是预定义函数和对象, 也不能包含预定义函数和对象
	 * */
	function copy(arg0) {
		// fn_body, fn_args are not used except that arg0 is a function
		var arg1, val, atype, i, length, arr = [], fn_body, fn_args;
		var types = {'undefined':1,'null':1,'number':1,'boolean':1,'string':1,'array':2,'function':3,'date':4};

		function copyItem(i) {
			val = arg0[i];
			atype = types[type(val)];
			if (1 == atype) {
				// undefined, null, number, boolean, string
				arg1[i] = val;
			} else if (4 == atype) {
				// date
				arg1[i] = new Date;
				arg1[i].setTime(val.getTime());
			} else {
				// object, array, or function
				arg1[i] = copy(val);
			}
		}

		arg1 = arg0;
		if (arg1) {
			atype = types[type(arg0)];
			if (!atype) {
				// object
				arg1 = new arg0.constructor;
				for (i in arg0) copyItem(i);
			} else if (2 == atype) {
				// array
				arg1 = [];
				for (i = 0, length = arg0.length; i < length; i++) copyItem(i);
			} else if (3 == atype) {
				// function
				// how to copy a function
				// maybe I can create a new Function Object
				arg1 = arg0 + '';
				fn_args = arg1.substring(arg1.indexOf('(') + 1, arg1.indexOf(')'));
				fn_body = arg1.substring(arg1.indexOf('{') + 1, arg1.lastIndexOf('}'));
				// 本地方法, 无法复制
				if ('[native code]' == fn_body) {
					log('copy() can\'t copy native method : ' + arg1, 2);
				}
				if (fn_args.length) {
					fn_args = fn_args.split(',');
					fn_args[fn_args.length] = fn_body;
					// let Global point to this
					arg1 = FnConstructor.apply(base.global, fn_args);
				} else
					arg1 = new Function(fn_body);
			} else if (4 == atype) {
				// date
				arg1 = new Date;
				arg1.setTime(arg0.getTime());
			//} else {// number, boolean, string
			}
		//} else {// null, undefined, 0, false, ''
		}
		return arg1;
	}

	/**
	 * a 与 b 相等, strict 表示严格相等
	 * */
	function equal(a, b, strict) {
		return strict ? a === b : a && b ? JSON.stringify(a) == JSON.stringify(b) : a == b;
	}

	/**
	 * 迭代 items, 执行 callback(item, key) => item 指迭代元素, key 指 元素索引或者 对象 key
	 * 如果 callback 返回 false, 终止迭代
	 * items 可以是数组, 类数组, 对象
	 * */
	function each(items, callback) {
		// callback(item, key)
		var i, length;

		if (!items || !isFn(callback)) {
			return;
		}

		if (items.constructor == ObjConstructor) {
			for (i in items) {
				if(false === callback.call(items[i], items[i], i)) {
					return;
				}
			}
		} else {
			for (i = 0, length = items.length; i < length; i++) {
				if(false === callback.call(items[i], items[i], i)) {
					return;
				}
			}
		}
	}

	/**
	 * 迭代 items 所有属性, 不管 callback 返回值
	 * */
	function walk(items, callback) {
		// callback(item, key)
		var i, length;

		if (items.constructor == ObjConstructor) {
			for (i in items) {
				callback.call(items[i], items[i], i);
			}
		} else {
			for (i = 0, length = items.length; i < length; i++) {
				callback.call(items[i], items[i], i);
			}
		}
	}

	/**
	 * 迭代 items 所有属性, 返回一个对象或者数组，包含每次调用 callback 的返回值
	 * */
	function map(items, callback) {
		// callback(item, key)
		var i, length, rs;

		if (items.constructor == ObjConstructor) {
			rs = {};
			for (i in items) {
				rs[i] = callback.call(items[i], items[i], i);
			}
		} else {
			rs = [];
			for (i = 0, length = items.length; i < length; i++) {
				rs[i] = callback.call(items[i], items[i], i);
			}
		}

		return rs;
	}

	/**
	 * 返回 obj 拥有的函数列表
	 * */
	function functions(obj, with_length) {
		var k, item, fs = [], nth = 0;
		if (with_length) {
			for (k in obj) {
				item = obj[k];
				isFn(item) ? fs[nth++] = k + '(' + item.length: '';
			}
		} else {
			for (k in obj) {
				isFn(obj[k]) ? fs[nth++] = k : '';
			}
		}
		return fs;
	}

	/**
	 * 数组 arr 是否拥有元素 item
	 * */
	function has(arr, item) {
		return index(arr, item) > -1;
	}

	/**
	 * 返回元素 item 在 arr 中的位置, reverse 表示从后往前 search
	 * 增加对伪数组的支持
	 * */
	function index(arr, item, reverse) {
		if (arr == null || item == null) {
			return -1;
		}

		return reverse ? rightIndex(arr, item) : leftIndex(arr, item);
	}

	/**
	 * 返回数组 source 与 filter 的交集
	 * */
	function intersect(source, filter) {
		var rs = [], item, i, length;
		for (i = 0, length = source.length; i < length; i++) {
			item = source[i];
			index(filter, item) > -1 && rs.push(item);
		}
		return rs;
	}

	/**
	 * 左侧索引
	 * arr 可以是数组, 类数组, 字符串
	 * */
	function leftIndex(arr, item) {
		if (arr.indexOf) {
			return arr.indexOf(item);
		}

		for (var i = 0, length = arr.length; i < length; i++) {
			if (item === arr[i]) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * 右侧索引, 类型同 leftIndex
	 * */
	function rightIndex(arr, item) {
		if (arr.lastIndexOf) {
			return arr.lastIndexOf(item);
		}

		for (var i = arr.length - 1; i > -1; i--) {
			if (item === arr[i]) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * unique 数组, 如果参数 arr 不是数组, 返回 undefined
	 * */
	function unique(arr) {
		if (!isArr(arr)) {return;}

		var i, length, o = {}, val, a = [], index = 0;
		for (i = 0, length = arr.length; i < length; i++) {
			val = arr[i];
			if (!o[val]) {
				o[val] = 1;
				a[index++] = val;
			}
		}

		return a;
	}

	/**
	 * 返回 a 到 b 之间的随机数
	 * */
	function rand(a, b) {
		a = a != undefined ? a + 0 === a ? a : parseInt(a, 10) : 0;
		b = b != undefined ? b + 0 === b ? b : parseInt(b, 10) : 0;
		if (isNaN(a) || isNaN(b)) {
			a = NaN;
		} else {
			if (a == b) {
				arguments.length == 0 ? a = Math.random() : '';
			} else {
				b < a ? a = [ b, b = a ][0] : '';
				a = Math.ceil(a + (b - a) * Math.random());
			}
		}
		return a;
	}

	function getAccuracy(num, accuracy, fill) {
		var pos, zeros;
		if (accuracy > 0) {
			num += '';
			pos = num.indexOf('.');

			pos > -1 ? num = num.substr(0, pos + accuracy + 1) : 0;
			if ((pos == -1 || pos + accuracy + 1 > num.length) && fill) {
				pos == -1 ? num += '.' : accuracy = (accuracy - num.length + pos + 1);
				pos = 0;
				zeros = [];
				while(pos++ < accuracy) {
					zeros.push(0);
				}
				num += zeros.join('');
			}
		} else if (accuracy == 0) {
			num = parseInt(num) + '';
		}

		return num;
	}

	function parsefloat(str, accuracy, fill) {
		str = parseFloat(str);
		return isNaN(str) ? str : parseFloat(getAccuracy(str, accuracy, fill));
	}

	/**
	 * 获取 request uri 类似于 php $_SERVER['REQUEST_URI']
	 * */
	function getRequestUri(full) {
		var loc = location, path = loc.pathname.substr(1);
		return full ? loc.protocol + '//' + loc.hostname + path : path;
	}

	/**
	 * 返回 url 中的 query key 的 值
	 * s 为
	 * */
	function getUrlParam(key, s){
		var pos, i, length, val, query, list, item;

		s ? '' : s = location.href;
		pos = s.indexOf('?');
		pos > -1 ? s = s.substring(pos, s.length) : '';

		if (s.substr(0, 1) == '?' && s.length > 1) {
			query = s.substring(1, s.length);
			list = query.split('&');

			for (i = 0, length = list.length; i < length; i++) {
				item = list[i].split('=');
				if (item[0] == key && item.length == 2) {
					val = item[1];
					break;
				}
			}
		}
		return val;
	}

	function param() {}

	/**
	 * 解析 string, 限制两层以内
	 * 'name[]=seven&name[]=zheng&age=22' => {name : ['seven', 'zheng'], age : 22}
	 * compatible with url : 'seven.com?name=seven' => {name : seven}
	 * */
	function parseStr(str, decode) {
	}

	/**
	 * escape HTML
	 * */
	function escapeHTML(s) {
		return s && (s + '').replace(/&/g, '&amp;').replace(/ /g, '&nbsp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	/**
	 * 从 html 转回 input 框可见
	 * */
	function descapseHTML(s) {
		return s && (s + '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
	}

	/**
	 * 返回长度为 length 的随机字符串, length 默认为 10
	 * */
	function randString(length, as_number) {
		var s = '', chars = as_number ? '0123456789' : 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM', l = length || 10, max = chars.length;
		for (i = 0; i < l; i++) s = s + chars[Math.floor(Math.random() * max)];
		return s;
	}

	/**
	 * 去掉 s 两端空白
	 * */
	function trim(s) {
		return null == s ? '' : (s + '').replace(/^\s+/, '').replace(/\s+$/, '');
	}

	/**
	 * 去掉 s 所有空白
	 * */
	function trimA(s) {
		return null == s ? '' : (s + '').replace(/\s/g, '');
	}

	/**
	 * 把字符串 str 转换为 unicode 码
	 * */
	function toUnicode(str) {
		var i, length, chr, unicode = '';
		if (isStr(str)) {
			for (i = 0, length = str.length; i < length; i++) {
				chr = str[i];
				unicode = unicode + '\\u' + chr.charCodeAt(0).toString(16);
			}
		}
		return unicode;
	}

	/**
	 * 全角转换为半角
	 * */
	function toDBC(str) {
		var dbc = '', c, i, length;

		if (isStr(str)) {
			for (i = 0, length = str.length; i < length; i++) {
				c = str.charCodeAt(i);
				if (c == 12288) {
					dbc += String.fromCharCode(32);
				} else if (c > 65280 && c < 65375) {
					dbc += String.fromCharCode(c - 65248);
				} else {
					dbc += String.fromCharCode(c);
				}
			}
		}

		return dbc;
	}

	/**
	 * 合并数组和伪数组, 可以传入多个参数, 至少 1 个
	 * 合并到 first
	 * */
	function mergeArray(first, second/*, third ...*/) {
		var args = arguments, i = first.length, j, length, nth = 1;
		while (second = args[nth++]) {
			for (j = 0, length = second.length; j < length; j++) {
				first[i++] = second[j];
			}
		}
		first.length = i;

		return first;
	}

	function mergeObject(first, second/*, third ...*/) {
		var rs = copy(first);
	}

	/**
	 * 删除数组元素, 从 start 开始, 删除长度为 length
	 * */
	function deleteArrayElement(arr, start, length) {
		length && length > 0 ? '' : length = 1;
		return start > -1 ? isArr(arr) ? arr.slice(0, start).concat(arr.slice(start + length)) : arr : arr;
	}

	/**
	 * 根据字符串返回 date 对象
	 *
	 * @example
	 *  1 => 公元元年1月1日, 		y
	 *  1-1 => 今年年1月2日, 		m-d
	 *  1-1-1 => 公元元年1月1日,	 	y-m-d
	 * */
	function makeDate(str) {
		var ymd, y, m, d, date = new Date, y_start = 1900;

		if (isStr(str)) {
			ymd = trim(str).match(/^(\d+)[\-|\/](\d+)[\-|\/](\d+)$/);
			if (ymd) {
				if (ymd[3]) {
					// y-m-d
					y = ymd[1];
					m = ymd[2];
					d = ymd[3];
				} else if (ymd[2]) {
					// m-d
					y = date.getYear() + y_start;
					m = ymd[1];
					d = ymd[2]
				} else {
					// y
					y = ymd[1];
					m = 1;
					d = 1;
				}
			}
		}

		// return date;
	}

	/**
	 * 1 根据伪数组创建数组
	 * 2 去掉对象 key, 返回对象属性值构成的数组
	 * */
	function makeArray(fake) {
		var i, length, arr = [];

		if (isNU(fake)) {
			return arr;
		}

		try {
			arr = [].slice.call(fake, 0);

			if (!arr.length && isObj(fake)) {
				for (i in fake) {
					hasOwn(fake, i) && arr.push(fake[i]);
				}
			}
		} catch (e) {
			// < ie9 error
			if (fake.length == null) {
				for (i in fake) {
					hasOwn(fake, i) && arr.push(fake[i]);
				}
			} else {
				for (i = 0, length = fake.length; i < length; i++) {
					arr.push(fake[i]);
				}
			}
		}

		return arr;
	}

	/**
	 * 根据字符串 str 创建对象
	 *
	 * @param String str
	 * @param Any value
	 *
	 * @returns Object
	 *
	 * @example 'a.b.c.d' => { a : b : { c : { d : [1, 2, 3] } } } }
	 * */
	function makeObject(str, value) {
		var variable, tmp, key, keys, context;

		context = {};

		if (isStr(str)) {
			str = trim(str).replace(/^\.+/, '').replace(/\.+$/, '');
			keys = str.split('.');
			variable = keys.shift();

			//context = this;
			while (key = keys.pop()) {
				tmp = value;
				value = {};
				value[key] = tmp;
			}

			context[variable] = value;
		}

		return context;
	}

	/**
	 * 使用 localStorage
	 * val 为 null 时删除 key
	 * */
	function storage(key, val) {
		var str, ls = localStorage;

		if (!isStr(key)) {
		} else if (null === val) {
			// remove
			ls.removeItem(key);
		} else if (1 == arguments.length) {
			// get
			key = ls.getItem(key);
			key = undefined === key ? undefined : JSON.parse(key);
			key == null ? key = undefined : '';

			return key;
		} else {
			// set
			str = JSON.stringify(val);
			ls.setItem(key, str);
		}
	}

	if (typeof JSON == 'undefined') {
		storage = function(key, val) {}
	}

	/**
	 * 启动性能分析
	 * */
	function poBegin(name) {
		name && console.profile(name);
	}

	/**
	 * 结束性能分析
	 * */
	function poEnd(name) {
		name && console.profileEnd(name);
	}

	/**
	 * 执行函数
	 * */
	function run(fn, args, context) {
		if (isFn(fn)) {
			// there is a bug, when args[0] is an array
			return fn.apply(context || base.global, isArr(args) ? args : [args]);
		}
	}

	/**
	 * 获取事件对于 target 的偏移, 兼容 Firefox, Firefox 没有提供 offsetX
	 * */
	function getEventOffset(evt) {
		if (evt) {
			if (evt.offsetX == null) {
				// firefox
				return getOffset(evt);
			} else {
				return {
					x : evt.offsetX,
					y : evt.offsetY
				}
			}
		}
	}

	var db, dd;

	var mousePisition = {
		win : function(evt) {
			return {
				x : evt.clientX + pageXOffset,
				y : evt.clientY + pageYOffset
			};
		},
		db : function(evt) {
			return {
				x : evt.clientX + db.scrollLeft,
				y : evt.clientY + db.scrollTop
			};
		},
		dd : function(evt) {
			return {
				x : evt.clientX + dd.scrollLeft,
				y : evt.clientY + dd.scrollTop
			};
		}
	};

	/**
	 * 获取鼠标位置
	 * */
	function getMousePosition(evt){
		db = doc.body;
		dd = doc.documentElement;

		if (typeof pageXOffset == 'number') {
			getMousePosition = mousePisition.win;
		} else if (typeof doc.compatMode != 'undefined' && doc.compatMode != 'BackCompat') {
			getMousePosition = mousePisition.dd;
		} else {
			getMousePosition = mousePisition.db;
		}

		return (base.getMousePosition = getMousePosition)(evt);
	}

	/**
	 * 仅返回 false
	 * */
	function returnFalse() {
		return false;
	}

	/**
	 * 返回事件元素距离当前页面可见区域左上角的偏移
	 * */
	function getVisibleOffset(evt/*, ignoreEventOffset*/) {
		var offset, event_offset, db, dd, width, height;

		db = doc.body;
		dd = doc.documentElement;
		width = dd.clientWidth || db.clientWidth || 0;
		height = dd.clientHeight || db.clientHeight || 0;

		if (undefined ==  evt.pageX) {
			offset = {
				left : evt.clientX,
				top : evt.clientY
			};
		} else {
			offset = {
				left : evt.pageX - (dd.scrollLeft || db.scrollLeft),
				top : evt.pageY - (dd.scrollTop || db.scrollTop)
			};
		}

		offset.right = width - offset.left;
		offset.bottom = height - offset.top;

		var ignoreEventOffset = false;
		if (ignoreEventOffset) {
			if (event_offset = getEventOffset(evt)) {
				offset.x -= event_offset.x;
				offset.y -= event_offset.y;
			}
		}

		return offset;
	}

	function getOffset(evt) {
		var target = evt.target, pageCoord, eventCoord, offset;
		target.offsetLeft == undefined ? target = target.parentNode : 0;

		pageCoord = getPageCoord(target);
		eventCoord = {
			x: window.pageXOffset + evt.clientX,
			y: window.pageYOffset + evt.clientY
		};

		return {
			x: eventCoord.x - pageCoord.x,
			y: eventCoord.y - pageCoord.y
		}
	}

	function getPageCoord(element) {
		var coord = {x : 0, y : 0};

		while (element){
			coord.x += element.offsetLeft;
			coord.y += element.offsetTop;
			element = element.offsetParent;
		}

		return coord;
	}

	/**
	 * 停止事件冒泡
	 * */
	function stopBubble(e) {
		if (e) {
			if (e.stopPropgation) {
				e.stopPropgation();
			}

			e.cancelBubble = true;
		} else if (base.global.event) {
			base.global.event.cancelBubble = true;
		}
	}

	/**
	 * 标识函数, 返回一个对象 {is : fn, on : fn, off : fn}, is 用于判断, on 和 off 用于设置
	 * */
	function Flag(on) {
		var _on = !!on;

		return {
			is : function(on) {
				return on == null ? _on : _on == !!on;
			},
			on : function(){
				_on = true;
			},
			off : function() {
				_on = false;
			}
		};
	}

	/**
	 * 计时器
	 * */
	function Timer() {
		var start = (new Date).getTime(), end = 0;

		return {
			start : function() {
				start = (new Date).getTime();
				end = 0;
			},
			end : function() {
				end = (new Date).getTime();
				return end - start;
			},
			differ : function() {
				return (end || (new Date).getTime()) - start;
			}
		};
	}

	/**
	 * js simple unit test
	 * @param fn
	 * @param args
	 * @param expect
	 * @param context
	 * */
	function testLog(a) {console.log(a);};
	function test(fn, args, expect, context) {
		var d, m, s, actual, check;
		if (isFn(fn)) {
			d = new Date;
			m = d.getMinutes();
			s = d.getSeconds();
			m < 10 ? m = '0' + m :  '';
			s < 10 ? s = '0' + s :  '';
			testLog(m + ':' + s + '.' + d.getMilliseconds() + '>>test() start');

			try {
				if (1 < arguments.length) {
					context == undefined ? context = global : '';
					check = 2 < arguments.length;

					if (check) {
						actual = fn.apply(context, args);
						if (expect === actual) {
							log(['test(fn) ok'], 0);
						} else {
							log(['test(fn) error', 'expect : ', expect, 'actual : ', actual], 2);
						}
					} else {
						fn.apply(context, args);
					}
				} else {
					fn();
				}
			} catch (e) {
				log(e, 2);
			} finally {
				d = new Date;
				m = d.getMinutes();
				s = d.getSeconds();
				m < 10 ? m = '0' + m :  '';
				s < 10 ? s = '0' + s :  '';
				testLog(m + ':' + s + '.' + d.getMilliseconds() + '>>test() end');
			}
		} else {
			log('test(fn, extra) param fn should be a function', 2);
		}
	}

	// 方法结束

	// base 对外开放 api 开始

	base.config = config;
	base.hasOwn = hasOwn;

	base.type = type;
	base.isArr = isArr;
	base.isFn = isFn;
	base.isObj = isObj;
	base.isStr = isStr;
	base.isNU = isNU;
	base.isNaN = isNaN2;
	base.isRef = isRef;

	base.addMember = addMember;
	base.addProto = addProto;

	base.copy = copy;
	base.each = each;
	base.walk = walk;
	base.map = map;
	base.equal = equal;
	base.functions = functions;
	base.run = run;

	base.has = has;
	base.index = index;
	base.intersect = intersect;
	base.unique = unique;

	base.rand = rand;

	base.getAccuracy = getAccuracy;
	base.parseFloat = parsefloat;
	base.getRequestUri = getRequestUri;
	base.getUrlParam = getUrlParam;
	base.escapeHTML = escapeHTML;
	base.descapseHTML = descapseHTML;
	base.randString = randString;
	base.trim = trim;
	base.trimA = trimA;
	base.toUnicode = toUnicode;
	base.toDBC = toDBC;

	base.mergeArray = mergeArray;
	base.deleteArrayElement = deleteArrayElement;
	base.makeDate = makeDate;
	base.makeArray = makeArray;
	base.makeObject = makeObject;

	base.storage = storage;

	base.poBegin = poBegin;
	base.poEnd = poEnd;

	base.run = run;
	base.getEventOffset = getEventOffset;
	base.getVisibleOffset = getVisibleOffset;
	base.getMousePosition = getMousePosition;
	base.returnFalse = returnFalse;
	base.stopBubble = stopBubble;
	base.test = test;

	base.Flag = Flag;
	base.Timer = Timer;

	// extend to global
	this.head = head;
	this.hasOwn = hasOwn;
})();

/**
 * 其他扩展方法
 * */
String.prototype.trim = function() {return isapp.trim(this.valueOf());};
String.prototype.trimA = function() {return isapp.trimA(this.valueOf());};
String.prototype.toDBC = function() {return isapp.toDBC(this.valueOf())};

isapp.hasChinese = function(s) {return /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/.test(s);};
isapp.isChinese = function(s) {return /^[\u4E00-\u9FA5]|^[\uFE30-\uFFA0]/.test(s);};
isapp.hasJapanese = function(s) {return /[\u0800-\u4e00]/.test(s);};
isapp.isJapanese = function(s) {return /^[\u0800-\u4e00]/.test(s);};
isapp.hasKorean = function(s) {return /[\u3130-\u318F]|[\uAC00-\uD7A3]/.test(s);};
isapp.isKorean = function(s) {return /^[\u3130-\u318F]|^[\uAC00-\uD7A3]/.test(s);};
isapp.isDoubleByte = function(letter) {return letter && letter.charCodeAt(0) > 255;};

// 基本方法结束


/**
 * 2 模块功能
 *
 * 以下内容向 isapp 增加模块化功能
 *
 * isapp.add() => isapp.use(), 模块需先定义, 然后才能使用
 * */
;(function () {
	var model;
	var Module, Req, ms;
	var doc, head;
	var isArr, isFn, isObj, isStr, isRef;
	var T, F;

	model = {};
	if (this.isapp) {
		model = isapp;
	}

	if (model.prototype) {
		model.prototype.author = 'web team';
	}

	doc = document;
	head = doc.head || doc.getElementsByTagName('head')[0];

	isArr = model.isArr;
	isFn = model.isFn;
	isObj = model.isObj;
	isStr = model.isStr;
	isRef = model.isRef;

	T = true;
	F = false;

	/**
	 * @param name required
	 * 			rule 1: start with letters, blanks is not allowed
	 * 			rule 2: 'file' => file.js or 'dir/file' => dir/file.js,
	 * @param config optional, notice! if config is a function, set config as exports
	 * 		exports
	 * 			the only part of Module can be accessed outside
	 * 			mixed type
	 * 		requires
	 * 			string or array, other module's name
	 * 		css
	 * 			string or array, ".css" can be ellipsised
	 * 		v
	 * 			add v to src, such as model.js?version=1.0.1a whose v is "version=1.0.1a"; if "version" or other v is not given, v is set to "v=1.0.1a"
	 * 		path
	 * 			override the default path calculated from module's name if it is given
	 * 		file
	 * 			create a script tag to get a javascript file if file is true, default true
	 * requires and v will be transfered
	 *
	 * config : undefined, null, or function; config.exports = config when config is a function
	 * */
	Module = function (name, config) {
		var i, length, path, require;

		config ? isFn(config) ? config = {exports : config, file : false} : '' : config = {};
		path = config.path ? model.trimA(config.path) : '';

		this.name = name;
		this.exports = config.exports || {};
		this.is_fn = isFn(this.exports);
		this.executed = !this.is_fn;
		this.requires = !config.requires ? [] : isArr(config.requires) ? config.requires : [config.requires];
		this.css = !config.css ? [] : isArr(config.css) ? config.css : [config.css];
		this.css_loaded = !this.css.length;

		this.file = path ? true : true == config.file;
		this.loaded = !this.file && !this.requires.length;
		this.path = path ? /:\//.test(path) ? path : model.config('root') + path : true == this.loaded ? '' : model.config('root') + name.replace('.', '/');

		for (i = 0, length = this.requires.length; i < length ; i++) {
			require = this.requires[i];
			/\?/.test(require) ? this.requires[i] = require.substr(0, require.indexOf('?')) : '';
		}

		this.path ? /\.js$/.test(this.path) || /\.js\?*$/.test(this.path) ? '' : this.path = this.path + '.js' : '';
		if (config.v && this.path) {
			config.v.indexOf('=') > 0 ? '' : config.v = 'v=' + config.v;
			this.path = this.path + (/\?/.test(this.path) ? '&' : '?') + config.v;
			this.path = this.path.replace(/\?&/, '?');
		}
	};

	/**
	 * @return an object which contains the given module's requires (recursion), contains itself
	 * */
	Module.prototype.getRequires = function() {
		var requires = {}, i, length, m, rs = this.requires;
		if (rs[0]) {
			for (i = 0, length = rs.length; i < length; i++) {
				m = ms[rs[i]];
				if (m instanceof Module) model.addMember(requires, m.getRequires());
				else log('undefined Module : <' + rs[i] + '> required by <' + this.name + '>', 2);
			}
		}
		this.file ? requires[this.name] = this.path : '';
		return requires;
	};

	/**
	 * useful when module.exports is a function and havn't run
	 * */
	Module.prototype.exec = function() {
		var i, length,rs = [], requires;
		if (!this.executed && this.is_fn) {
			requires = this.requires;
			if (requires[0]) {
				for (i = 0, length = requires.length; i < length; i++) rs[i] = ms[requires[i]].exec();
				this.exports = this.exports.apply(model.global, rs);
			} else this.exports = this.exports();
			this.executed = true;
		}
		return this.exports;
	};

	/**
	 * 存储所有 Module 实例
	 * */
	ms = {};

	Req = {
		scripts : {},
		loading : F,
		list : [],
		index : 0,
		stack : function() {
			Req.loading = F;
			Req.list = [];
			Req.index = 0;
		},
		inner : null
	};

	Req.inner = function(src, recursive, loaded) {
		var script, callback;
		/**
		 * Req.list = Req.list.concat(src);
		 * src = Req.list.shift();
		 *
		 * 记录
		 * 采用注释内的方式获取未加载的 js 文件 会产生一个问题：
		 * 		Req.list 数组中有一个 a.js，正确加载之后 又 需要引用 a.js，
		 * 		此时，Req.list 数组中已经又有 a.js，所以 concat 函数会再一次
		 * 		把 a.js 加入数组中，再一次请求 js 文件。
		 * 		这个问题其实在 model.use 函数中已经规避了，
		 * 		因为 use 函数会记录每个模块的加载情况，也就不会再次对相同的 js 文件进行 require。
		 * 		但是在单独测试 require 方法时，这个问题出现了，所以我再添加一层记录，
		 * 		在 require 层记录所有引入的 js 文件。
		 * */

		Req.list = Req.list.concat(src);

		// downloading && non't recursive
		if (Req.loading && !recursive) {
			return;
		}

		Req.loading = true;
		src = Req.list[Req.index++];

		if (src) {
			if (!Req.scripts[src]) {
				script = doc.createElement('script');
				script.charset = model.config('charset');
				script.type = 'text/javascript';
				script.src = src;

				if (script.readyState){
					script.onreadystatechange = function(){
						if ('loaded' == script.readyState || 'complete' == script.readyState){
							script.onreadystatechange = null;
							Req.scripts[src] = 1;
							Req.inner(0, true);
						} else if ('error' == script.readyState) {
							script.onreadystatechange = null;
							Req.scripts[src] = -1;
							Req.inner(0, true, false);
						}
					};
				} else {
					script.addEventListener('load', function() {
						Req.scripts[src] = 1;
						Req.inner(0, true);
					}, false);

					script.addEventListener('error', function() {
						Req.scripts[src] = -1;
						Req.inner(0, true, false);
					}, false);
				}

				head.appendChild(script);
			} else {
				Req.inner(0, true);
			}
		} else {
			Req.index--;
			// script download finished
			callback = Req.stack;

			Req.stack = function() {
				Req.loading = F;
				Req.list = [];
				Req.index = 0;
			};

			callback(loaded);
		}
	};

	// 方法结束

	/**
	 * @param name string or array
	 * 		'jquery'
	 * 		['jquery', 'dojo']
	 * 		[{name : 'jquery'}, {'name' : 'jquery-ui', { requires : 'jquery'}}]
	 * @param config see Module
	 * */
	function add(name, config) {
		var i, length, require, requires;

		if (isArr(name)) {
			for (i = 0, length = name.length; i < length; i++) isStr(name[i].name) ? model.add(name[i].name, name[i].config) : model.add(name[i], {file : 1});
		} else if (isStr(name) && model.trim(name)) {
			config && config.requires ? requires = config.requires : requires = [];

			if (ms[name]) {
				delete ms[name];
				ms[name] = new Module(name, config);
				log('Module : module <' + name + '> redefined');
			} else ms[name] = new Module(name, config);

			isArr(requires) ? '' : requires = [requires];
			for (i = 0, length = requires.length; i < length; i++) {
				require = model.trim(requires[i]);
				('' == require || /\s/.test(require)) && log('Module ： required module\'s name can\'t cantain any blanks(<' + require + '>)', 2);
				if (!ms[require]) {
					config = {file : 1};
					if (/\?/.test(require)) {
						require = require.split('?');
						config.v = require[1];
						require = require[0];
					}
					ms[require] = new Module(require, config);
				}
			}
		} else {
			log('Module constructor : module\'s name is required and can\'t cantain any blanks(<' + name + '>)', 2);
		}
		return model;
	}

	/**
	 * multi-module is support
	 * 'dom' or 'dom,ajax' or ['dom', 'ajax']
	 * */
	function use(name, fn) {
		var i, length, names, m, modules, unload_ms, exports, rs, callback, result, arr;

		function getRequires(module) {
			var i, length, req, reqs, req_scripts, loaded_scripts = doc.getElementsByTagName('script');
			reqs = module.getRequires();
			req_scripts = {};
			for (req in reqs) req_scripts[reqs[req]] = req;
			for (i = 0, length = loaded_scripts.length; i < length; i++) req_scripts[loaded_scripts[i].src] && delete req_scripts[loaded_scripts[i].src];
			reqs = [];
			i = 0;
			for (req in req_scripts) reqs[i++] = req;
			return reqs;
		}

		modules = [];
		unload_ms = [];
		exports = [];
		rs = [];
		names = isArr(name) ? name : isStr(name) ? model.trimA(name).split(',') : '';
		if ('' == names) {
			return log('use(name, fn) name is should be an array or string', 2);
		}
		for (i = 0, length = names.length; i < length; i++) {
			m = ms[names[i]];

			if (m instanceof Module) {
				modules[i] = m;
				exports[i] = m.exports;
				if (!m.css_loaded) {
					model.css(m.css);
					m.css_loaded = true;
				}
				if (!m.loaded) {
					arr = getRequires(m);
					if (arr[0]) {
						unload_ms[unload_ms.length] = m;
						rs = rs.concat(arr);
					} else m.loaded = true;
				}
			} else return log('undefined Module : <' + names[i] + '>', 2);
		}
		rs = model.unique(rs);
		if (rs[0]) {
			callback = function() {
				for (i = 0, length = unload_ms.length; i < length; i++) {
					unload_ms[i].loaded = true;
				}
				use(names, fn);
			};
			model.require(rs, callback);
		} else {
			for (i = 0, length = modules.length; i < length; i++) {
				if (!modules[i].executed) {
					exports[i] = modules[i].exec();
				}
			}
			fn ? isFn(fn) ? result = fn.apply(model.global, exports) : log('use(name, fn) <fn> should be a function') : '';
			return result;
		}
	}

	/**
	 * @param {src} string(javascript file path) or array
	 * */
	function require(src, fn) {
		var require_fn, type = model.type(src);

		if ('string' != type && 'array' != type) {
			return log('require(src, fn) <src> should be a string or an array');
			src = [];
		}

		require_fn = Req.stack;

		if (isFn(fn)) {
			Req.stack = function(loaded) {
				require_fn(loaded);
				loaded === false || fn();
			};
		} else fn && log('require(src, fn) <fn> should be a function');

		Req.inner(src);

		return model;
	}

	/**
	 * 返回指定 module
	 * */
	function getModule(name) {
		var module = ms[name];
		if (module) {
			if (module.executed) {
				module = module.exports;
			} else {
				// there is a hidden danger
				use(name);
				module = module.exports;
			}
		}

		return module;
	}

	/**
	 * 判断 module 是否已定义
	 * */
	function hasModule(name) {
		return model.index(list(), name) > -1;
	}

	/**
	 * 到处 module
	 * */
	function exports(name, alias, context) {
		var module;
		if (name && isStr(alias) && hasModule(name)) {
			isRef(context) ? '' : context = model.global;
			context[alias] && log('exports(name, alias, context) alias of '+ context + ' exists');
			context[alias] = getModule(name);
		}
	}

	/**
	 * 返回 module 列表
	 * */
	function list() {
		var m, list=[], length = 0;
		for(m in ms) {
			list[length++] = ms[m].name;
		}
		return list;
	}

	/**
	 * 移除 module
	 * */
	function remove(name) {
		return ms[name] && delete ms[name];
	}

	/**
	 * 发起 css 请求
	 * @param {href} string or array, '.css' can be ellipsised
	 * @param {media} optional
	 * */
	function css(href, media) {
		if (!href || !(href + '').length) return model;

		var i, length, style, src, css_root = model.config('css_root');
		href + '' === href ? href = [href] : '';
		media ? '' : media = model.config('media');
		for (i = 0, length = href.length; i < length; i++) {
			src = href[i];
			/:\//.test(src) ? '' : src = css_root + src;
			if (src) {
				style = doc.createElement('link');
				style.charset = model.config('charset');
				style.media = media;
				style.rel = 'stylesheet';
				style.href = src.match(/\.css/) ? src : src + '.css';
				head.appendChild(style);
			}
		}

		return model;
	}

	/**
	 * 预下载图片
	 * */
	function preImage(src, root) {
		root= root ? model.trim(root) : '';
		isArr(src) ? '' : src = [src];
		for(var i = 0, length = src.length; i < length; i++) {
			src[i] ? (new Image()).src = root + src[i] : '';
		}

		return base;
	}

	// 方法结束

	// base 对外开放 api 开始

	model.add = add;
	model.use = use;
	model.require = require;
	model.getModule = getModule;
	model.hasModule = hasModule;
	model.exports = exports;
	model.list = list;
	model.remove = remove;
	model.css = css;
	model.preImage = preImage;
})();

/**
 * 3 ajax, cookie, validator
 * */

// 提供基础 ajax接口
/**
 * 依赖于 jQuery.ajax 实现
 * 只调用一次回调
 *
 * @example isapp.ajax({
 * 							url : '/',
 * 							data : data,
 * 							async : true,
 *							errnoMap : {}
 * 						},
 * 						success(data),
 * 						error(errno, msg)
 * 					);
 *
 * @param errnoMap object
 * {
 * 		'>0' : callback // server busy
 * 		-3 : callback // login timeout
 * 		-105 : callback // token is out of reach
 * }
 * */
isapp.ajax = function ajax(options, success, error) {
	var request = options || {}, errnoMap = request.errnoMap;

	delete request.success;
	delete request.error;

	request.dataType = 'text';
	request.type = 'post';
	request.contentType = 'application/x-www-form-urlencoded';
	request.beforeSend = function(xhr) {
		var count = isapp.ajax.list.count++;
		xhr.__count = count;
		isapp.ajax.list[count] = xhr;
	};
	request.complete = function(xhr, status) {
		delete isapp.ajax.list[xhr.__count];

		if (status == 'abort') {
			return;
		}

		var json, text = isapp.trim(xhr.responseText), code = xhr.status, errno = 0;

		if ('' == text) {
			// text is empty when 500 happend
			log('isapp.ajax() none data received. http status: ' + code);

			if ((code > 200 && code < 300) || code == 304) {
				return;
			}
		}

		try {
			// 过滤 脚本注释 和 html 注释
			if (/\*\/$|-->$/.test(text)) {
				text = isapp.trim(text.replace(/\n|\r/g, '##\\n##').replace(/\/\*.*?\*\/$|<!--.*?-->$/, '').replace(/##\\n##/g, '\n'));
			}
			json = jQuery.parseJSON(text);
			errno = json.errno;
		} catch (e) {
			json = {};
			errno = status == 'timeout' ? -408 : -500;
			json.errno = errno;
			code in {400 : 1, 404 : 1, 500 : 1} ?
				log([code + ' happended. url : ' + request.url, JSON.stringify(request.data)], 2)
					: log(['isapp.ajax() responseText parse Error : ', e, text, request.url, JSON.stringify(request.data)], 2);
		}

		if (errno) {
			// error happend
			json.msg && log('isapp.ajax() error occured, url<' + request.url + '>, msg<' + json.msg + '>');
			if (errnoMap && errnoMap[errno]) {
				error = errnoMap[errno];
			} else {
				for (var key in errnoMap) {
					key += '';
					if ((key[0] == '>' && errno > key.substr(1)) || (key[0] == '<' && errno < key.substr(1))) {
						error = errnoMap[key];
						break;
					}
				}
			}

			isapp.isFn(error) && error(json.errno, json.msg);
		} else {
			isapp.isFn(success) && success(json.data == null ? '' : json.data);
		}
	};

	jQuery.ajax(request);
};

isapp.ajax.list = {count : 0};

//cookie
/**
* cookie and environment(domains)
*
* 应用到项目, 需要设置对应环境的域名
*
* isapp.domain.config(domains)
*
* @exmaple
*
* isapp.domain.config({
	dev : {
		s : 'www.devstatic.com',
		top : 'devcamcard.com'
	},
	test : {
		s : 'static.camcard.me',
		top : 'camcard.me'
	},
	online : {
		s : 'static.camcard.com',
		top : 'camcard.com'
	}
});
**/
;(function() {
	var base = {};
	var doc = document, current_domain = doc.domain, top_domain;

	this.isapp ? base = isapp : '';
	base.prototype ? base.prototype.author = 'web team' : '';

	base.domain = {};
	base.domain.config = function(domains) {
		var item;
		/*
		// domains 格式
		domains = {
			dev : {
				s : 'www.devstatic.com',
				top : 'devcamcard.com'
			},
			test : {
				s : 'static.camcard.me',
				top : 'camcard.me'
			},
			online : {
				s : 'static.camcard.com',
				top : 'camcard.com'
			}
		};*/
		for (var ent in domains) {
			if (hasOwn(domains, ent)) {
				base.ent[ent] = ent;

				item = domains[ent];

				base.domain[ent] = {
					m : item.m || current_domain,
					s : item.s,
					top : item.top,
					reg : item.reg || new RegExp(item.top.replace(/(\.|\-)/g, '\\$1'))
				}
			}
		}
		return base.detectEnt();
	};

	/**
	 * @todo 检测环境
	 * */
	base.detectEnt = function() {
		var domain = base.domain, ent, key, protocol = location.protocol, origin = location.origin || protocol + '//' + location.host;
		var main_domain, static_domain;

		for (key in domain) {
			if (hasOwn(domain, key) && domain[key].reg && domain[key].reg.test(origin)) {
				ent = key;
				break;
			}
		}

		if (ent) {
			main_domain = domain[ent].m;
			static_domain = domain[ent].s.https && base.has(protocol, 'https') ? domain[ent].s.https : domain[ent].s.http || domain[ent].s;
			top_domain = domain[ent].top;
		} else {
			main_domain = current_domain;
			static_domain = null;
			top_domain = current_domain.match(/\w+\.\w+$/);
			top_domain = top_domain && top_domain[0] ? top_domain[0] : null;
		}

		base.ent.current = ent;
		base.main_domain = main_domain;
		base.static_domain = static_domain;
		base.top_domain = top_domain;

		return ent;
	};

	/**
	 * eg.
	 *
	 * cookie('author', 'seven') 	=> set cookie
	 * cookie('author')				=> get cookie
	 * cookie('author', null)		=> delete cookie
	 *
	 **/
	function cookie(name, value, hours, domain, path) {
		var date, arr, reg;

		if (!base.isStr(name)) {
		} else if (undefined === value) {
			// get cookie
			value = null;
			reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');

			if(arr = doc.cookie.match(reg)){
				value = unescape(arr[2]);
			}

			return value;
		} else if (null === value) {
			// delete cookie
			cookie(name, '', -1);
		} else {
			// set cookie
			date = new Date;
			date.setTime(date.getTime() + (hours || 24) * 3600000);

			// 默认设置到顶级域名
			domain = undefined == domain ? top_domain ? '.' + top_domain : null : domain;

			if (null == domain) {
				// domain 为 null 时 不支持
				//log('cookie() domain is required');
			} else {

				domain = ';domain=' + domain;
				path = undefined == path ? ';path=/' : ';path=' + path;

				doc.cookie = name + '=' + escape(value) + ';expires=' + date.toGMTString() + domain + path;
			}
		}
	}

	/**
	 * 检查 指定 name 的 cookie 是否有多个
	 **/
	cookie.duplicated = function(name) {
		var reg, matchs;

		if (name && cookie(name)) {
			reg = new RegExp(name + '=', 'g');
			matchs = doc.cookie.match(reg);
			return matchs ? matchs.length > 1 : false;
		}

		return false;
	};

	cookie.unique = function(name, value, hours, domain) {
		if (name) {
			undefined == value ? value = cookie(name) : '';

			if (null == value) {
				// 没有找到对应的 cookie
				return;
			}

			cookie(name, '', -1, current_domain);
			cookie(name, '', -1, top_domain);

			cookie(name, value, hours, domain);
		}
	};

	// 对外 api 开始, 以下 函数和属性 供外部使用
	base.main_domain = null;
	base.static_domain = null;
	base.top_domain = null;

	base.ent = {};
	base.ent.current = null;

	base.cookie = cookie;

	base.deleteCookie = function(name) {
		cookie(name, null);
	};

	base.getCookie = function(name) {
		return cookie(name);
	};

	base.setCookie = function(name, value, hours, domain) {
		cookie(name, value, hours, domain);
	};

	/**
	 * @deprecated
	 *  替换为 isapp.ent.current
	 * */
	base.getEnt = function() {
		return base.ent.current;
	};
})();

//form validator
/**
* form validator
*
* @params {form_id} form's attribute id
* @params {validates} array objects
* 	validates : [
* 		{
* 		name : "user_email",
* 		rule : "email",
* 		fn : function(valid) {}
* 		}
* 	]
* @returns boolean whether validation passed
* */
;(function(){
	var base = isapp;

	function validator(form_id, validates) {
		var i, length, rule, validate, valid, ele, submit, form;

		form = jQuery('#' + form_id);
		if (0 == form.length) {return log('validator(form_id, validates) form is not found');}

		submit = true;
		length = validates ? validates.length : 0;
		for (i = 0; i < length; i++) {
			validate = validates[i];
			rule = validate.rule ? validate.rule.trim() : '';

			if (!rule) continue;

			ele = form.find("[name=" + validate.name + "]");
			valid = validOk(rule, ele);

			base.isFn(validate.fn) && validate.fn.call(ele[0], valid);

			if (0 !== valid) {
				submit = false;
				break;
			}
		}

		return submit;
	};

	/**
	 * @param ele jQuery object
	 * */
	var validOk = function(rule, ele) {
		var is, i, length, validators, rules, val;

		validators = {
			date : isDate,
			email : isEmail,
			mobile : isMobile,
			url : isUrl,
			empty : isEmpty,
			number : isNumber
		};

	 	val = ele.val();

		if (ele.prop('type') == 'text') {
			if ($.trim(val) != val) {
				val = $.trim(val);
				ele.val(val);
			}
		}

		rules = rule.split('|');
		for (i = 0, length = rules.length; i < length; i++) {
			rule = rules[i];
			if (validators[rule]) {
				is = validators[rule]('empty' == rule ? ele : val);
			} else {
				// length, range , match
				if (rule.indexOf('=') > -1) {
					rule = rule.split('=');
					rule[0] = rule[0].trim();
					is = 'length' == rule[0] ? isLength(val, rule[1])
						: 'range' == rule[0] ? isRange(val, rule[1])
							: 'match' == rule[0] ? isMatch(val, rule[1]) : 2;
				} else {
					is = 2;
				}
			}
			if (0 === is) break;
		}

		return is;
	};

	/**
	 * add a validator to some element
	 *
	 * @param {ele} 	dom node
	 * @param {rule}	eg. length=6,10 or reg=\\w (one more backslash) or email or date
	 * @param {fn}		callback, receive one parameter valid which means whether validation is passed
	 * */
	validator.single = function(id, rule, fn) {
		var ele = jQuery('#' + id);
		base.isFn(fn) && fn.call(ele[0], validOk(rule, ele));
	};

	function isDate(val) {
		if (!val) return 2;

		var is, d, ds = val.indexOf('/') > -1 ? val.split('/') : val.split('-');

		if (3 == ds.length) {
			d = new Date;
			d.setFullYear(ds[0], ds[1], ds[2]);
			is = ds[0] == d.getFullYear() && ds[1] == d.getMonth() && ds[2] == d.getDate() ? 0 : 1;
		} else {
			is = 1;
		}

		return is;
	};

	//var remail = /^([a-zA-Z0-9_-][.]{0,1})+@[a-zA-Z0-9._-]*[a-zA-Z0-9_-]+\.[a-zA-Z]{2,4}$/;
	var remail = /^[A-Za-z0-9!#$%&\'*+\/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.([A-Za-z]{2,})$/;

	function isEmail(val) {
		if (!val) return 2;
		//return remail.test(val) ? /@\./.test(val) ? 1 : 0 : 1;
		return remail.test(val) ? 0 : 1;
	};

	var rmobile = /^[+]{0,1}\d+$/;

	function isMobile(val) {
		if (!val) return 2;
		return rmobile.test(val) ? 0 : 1;
	};

	// domain and ip
	var rurl = /^(?:\w[a-zA-Z0-9-]*?\.)+[a-z]{2,4}$|^(?:\d{1,3}\.){3}\d{1,3}$/;

	function isUrl(val) {
		if (!val) return 2;
		val = base.trim(val).replace(/^(\w+)?:\/\//, '').replace(/\/.*$/, '');
		return rurl.test(val) ? /-\./.test(val) ? 1 : 0 : 1;
	};

	/*function isUrl2(val) {
		if (!val) return 2;

		val = base.trim(val);
		if (base.hasChinese(val)) {
			for (var i = 0, length = val.lastIndexOf('.'); i < length; i++) {
				if (base.isChinese(val[i])) {
					val = val.substr(0, i) + 'a' + val.substring(i + 1);
				}
			}

			if (i == 0) {
				return 1;
			}
		}

		val = val.replace(/^(\w+)?:\/\//, '').replace(/\/.*$/, '');
		return rurl.test(val) ? /-\./.test(val) ? 1 : 0 : 1;
	}*/

	function isEmpty(val) {
		if (base.isStr(val)) {
		} else {
			var type = val[0].type.toLowerCase();

			if ('checkbox' == type) {
				return val[0].checked ? 0 : 1;
			}

			if ('radio' == type) {
				val.each(function() {
					if (this.checked) {
						val = 0;
						return false;
					}
				});

				return val == 0 ? 0 : 1;
			}

			val = val[0].value;
		}

		return '' === val ? 1 : !val ? 2 : 0;
	};

	function isNumber(val) {
		if (0 === val) return 0;
		if (!val) return 2;
		return parseInt(val, 10) + '' === val + '' ? 0 : 1;
	};

	function isLength(val, length) {
		if (!val) return 2;

		var l = val.length, is, _l = length;
		_l = _l.trimA();
		if (_l.indexOf(',') > -1) {
			_l = _l.split(',');
			_l[0] ? _l[0] = parseInt(_l[0], 10) : _l[0] = 0;
			_l[1] ? _l[1] = parseInt(_l[1], 10) : _l[1] = 0;

			if (_l[0] == _l[1]) {
				is = l == _l[0];
			} else {
				if (_l[0] > _l[1]) {
					_l[0] = _l[0] + _l[1];
					_l[1] = _l[0] - _l[1];
					_l[0] = _l[0] - _l[1];
				}
				is = _l[0] <= l && l <= _l[1];
			}
		} else {
			_l = parseInt(_l, 10);
			is = l == _l;
		}
		return is ? 0 : 1;
	};

	function isRange(val, range) {
		if (!val && 0 !== val) return 2;

		var is, r = range;
		val = parseFloat(val);
		if (r.indexOf(',') > -1) {
			r = r.split(',');
			r[0] ? r[0] = parseFloat(r[0]) : r[0] = 0;
			r[1] ? r[1] = parseFloat(r[1]) : r[1] = 0;

			if (r[0] == r[1]) {
				is = val == r[0];
			} else {
				if (r[0] > r[1]) {
					r[0] = r[0] + r[1];
					r[1] = r[0] - r[1];
					r[0] = r[0] - r[1];
				}
				is = r[0] <= val && val <= r[1];
			}
		} else {
			is = val == parseFloat(r);
		}
		return is ? 0 : 1;
	};

	function isMatch(val, input_id) {
		var valid = 2, target;

		if (undefined != val && undefined != input_id) {
			target = document.getElementById(input_id);
			target ? valid = val === target.value ? 0 : 1 : 2;
		}

		return valid;
	};

	validator.isDate = isDate;
	validator.isEmail = isEmail;
	validator.isMobile = isMobile;
	validator.isUrl = isUrl;
	validator.isNumber = isNumber;
	validator.isLength = isLength;
	validator.isRang = isRange;

	this.isappFormValidator = validator;
})();

;(function() {
	var isapp = window.isapp || {};

	/**
	 * 预置模块
	 * */
	isapp.add([{
		name : 'jquery',
		config : {
			file : 0,
			v : '1.7.1',
			exports : function() {return jQuery;}
		}
	}, {
		name : 'translator',
		config : {
			version : 1.0,
			file : 0,
			exports : function(L, $) {
				var T = {};

				T.each = function(elements) {
					var text, tag;

					elements.each(function(index, ele) {
						var langid = ele.getAttribute('langid');

						// a template variable start with '$'
						if (langid && !/\$/.test(langid)) {
							tag = ele.tagName.toLowerCase();
							text = isapp.getLangText(langid);

							ele = jQuery(ele);
							if ('input' == tag) {
								switch (ele.attr('type')) {
								case 'button' :
								case 'submit' : {
									ele.data('deftext', text).val(text);
									break;
								}
								case 'text' : {
									ele.data('deftext', text).attr('placeholder', text);
									break;
								}
								}
							} else if ('img' == tag) {
								ele.attr('title', text);
							} else if ('textarea' == tag) {
								ele.attr('placeholder', text);
							} else if ('title' == tag) {
								document.title = text;
							} else if ('option' == tag) {
								ele.html(text);
							} else {
								// Not an form tag
								ele.data('deftext', text).html(text);
							}
						}
					});
				};

				T.replace = function(html) {
					if (html) {
						html = jQuery('<div>' + html + '</div>');
						T.each(html.find('[langid]'));
						return html.html();
					}
					return '';
				};

				return T;
			}
		}
	}, {
		name : 'template',
		config : {
			file : 0,
			v : '1.0',
			exports : function() {return TrimPath;}
		}
	}, {
		name : 'email_suggest',
		config : {
			file : 0,
			v : '1.0',
			exports : function() {
				var suggest = function(attach_id, input_id, es_id, color) {
					var es = new EmailSuggest(attach_id, input_id, es_id, color);
					es.create();
					es.addListener();
					es.attach();
					document.body.onresize = function() {
						es.attach();
					};
				};
				return suggest;
			}
		}
	}, {
		name : 'scroll',
		config : {
			file : 0,
			requires : 'jquery'
		}
	}]);

	// 多语言模块

	var lang_url_checked;
	var lang_cookie_id = '_ccl';
	var lang_default_id = 'en-us';
	var lang_supports = {
			'en' : 'en-us',
			'zh' : 'zh-cn',
			'zh-cn' : 'zh-cn',
			'zh-tw' : 'zh-tw',
			'zh-Hans' : 'zh-cn',
			'zh-Hant' : 'zh-tw',
			'zh-hans' : 'zh-cn',
			'zh-hant' : 'zh-tw',
			'de-de' : 'de-de',
			'en-us' : 'en-us',
			'fr-fr' : 'fr-fr',
			'ja-jp' : 'ja-jp',
			'ko-kr' : 'ko-kr'
		};

	// 返回当前页面语言 id
	isapp.getLangId = function() {
		var langid;

		if (lang_url_checked) {
			langid = isapp.cookie(lang_cookie_id);
		} else {
			lang_url_checked = 1;
			langid = isapp.getUrlParam('language') || isapp.getUrlParam('l') || isapp.cookie(lang_cookie_id);
		}

		if (lang_supports[langid]) {
			return lang_supports[langid];
		}

		isapp.cookie(lang_cookie_id, lang_default_id);

		return lang_default_id;
	};

	isapp.setLangId = function(langid) {
		// one year
		isapp.cookie(lang_cookie_id, langid, 8760);
	};

	isapp.setLangCookieId = function(cid) {
		lang_cookie_id = cid;
	};

	isapp.setLangSupports = function(supports) {
		if (supports) {
			lang_supports = supports;
			return true;
		}

		return false;
	};

	isapp.getLangText = function(key) { if (key) {
		var text = $('#lang_' + key).html();

		if (text == null) {
			return key;
		}

		return isapp.descapseHTML(text);
	}};

	var translate = isapp.translate = function(langid) {
		isapp.use('translator', function (T) {

			isapp.setLangId(langid);

			T.each(jQuery('[langid]'));

			// 翻译回调
			if (typeof translate.fn == 'function') {
				translate.fn();
			}

			var id = isapp.getLangId();

			langid = {
				'en-us' : 'en',
				'zh-cn' : 'zh_cn',
				'zh-tw' : 'zh_tw',
				'de-de' : 'de',
				'fr-fr' : 'fr',
				'ja-jp' : 'ja',
				'ko-kr' : 'ko'
			}[id] || 'en';

			jQuery('body #a_bb_download').attr('href', 'http://appworld.blackberry.com/webstore/content/13707/?lang=' + langid);

			for (var i = 0, length = translateCallback.length; i < length; i++) {
				translateCallback[i](id);
			}
		});
	}

	var translateCallback = [];

	/**
	 * 翻译回调
	 * */
	translate.addCallback = function(callback) {
		if (typeof callback == 'function') {
			translateCallback.push(callback);
		}
	};

	/**
	 * 格式化字符串, 替换 s 中 %s, %s2, %1, 其中 1, 2 顺序任意定
	 * */
	translate.format = function(s /*, p, p2*/) {
		var reg = /(%\w+)/, i = 1, pos;

		while (reg.test(s) && undefined != arguments[i]) {
			pos = s.match(reg)[1].match(/\d+/);
			if (pos && pos.length) {
				pos = parseInt(pos[0], 10);
				isNaN(pos) ? pos = i : '';
			} else {
				pos = i;
			}
			i++;

			s = s.replace(reg, arguments[pos]);
		}
		return s;
	};

	/**
	 * 翻译一段 html 字符串
	 * */
	isapp.translateReplace = function(html) {
		return isapp.use('translator', function(T) {
			return T.replace(html);
		});
	};
})();

/**
 * 定义各自项目的 Ajax 回调, 主要是设定 errnoMap, errnoMap 的 key 支持 '>','<'
 * CamCard isappAjax
 * */
function isappAjax(options, success, error) {
	options && options.hasOwnProperty ? 0 : options = {};
	options.errnoMap = {
		'>0' : function(errno) {
			var langid = isappAjaxError[-2], msg = isapp.getLangText(langid);
			isui.toastCommon(langid, 1);
			isapp.isFn(error) && error(errno, msg, langid);
		},
		'-105' : function () {
			// token is not right -105
			log('token is invalid');
			isappAjax({
				url : '/user/token'
			}, function() {
				// get corrent token and retry
				isappAjax(options, success, error);
			}, function(errno, msg, langid) {
				isui.toastCommon(langid, 1);
			});
		},
		'-3' : function () {
			// login timeout
			isui.dialogLogin();
		},
		'-4' : function() {
			location.reload(true);
		}
	};

	isapp.ajax(options, success, function(errno, msg) {
		var langid = isappAjaxError[errno];
		msg ? 0 : msg = isapp.getLangText(langid) || 'server busy';
		-2 == errno && isui.toastCommon(langid, 1);

		isapp.isFn(error) && error(errno, msg, langid);
	});
};

var isappAjaxError = (function() {
	var busy = 'cc_msg_network_busy';

	return {
		'-1' : busy,
		'-2' : busy,
		'-3' : busy,
		'-100' : busy,
		'-101' : busy,
		'-102' : 'cc_usr_comm_emailnotacceptable',
		'-103' : 'cc_comm_confirmpassword',
		'-104' : busy,
		'-105' : busy,
		'-106' : 'cc_comm_invalidemail',
		'-107' : busy,
		'-201' : 'cc_sys_email_notregistered',
		'-202' : 'cc_usr_comm_emailreged',
		'-203' : 'cc_sys_account_notactivated',
		'-204' : 'cc_comm_acount_activated',
		'-205' : 'cc_sys_account_disabled',
		'-206' : 'cc_comm_loginerror',
		'-207' : busy,
		'-208' : 'cc_comm_oldpwdwrong',
		'-211' : 'cc_comm_temp_unavail_info',
		'-221' : busy,
		'-231' : busy,
		'-232' : busy,
		'-233' : busy,
		'-301' : busy,
		'-302' : busy,
		'-303' : busy,
		'-304' : busy,
		'-305' : busy,
		'-306' : busy,
		'-307' : busy,
		'-310' : busy,
		'-311' : busy,
		'-312' : busy,
		'-313' : busy,
		'-350' : busy,
		'-351' : busy,
		'-401' : busy,
		'-402' : busy,
		'-403' : busy,
		'-500' : busy,
		'-501' : busy,
		'-502' : busy,
		'-503' : busy,
		'-504' : busy,
		'-505' : busy
	};
})();

/**
 * @see isappAjax
 * */
function isappFormAjax(form_id, success, error) {
	var form = $('#' + form_id);
	isappAjax({
		url : form.attr('action'),
		data : form.serialize()
	}, success, error);
};

/**
 * 特殊处理 iu 加载问题
 * */
var iu = (function() {
	var list = [];
	$(function() {
		for (var i = 0, length = list.length; i < length; i++) {
			iu.widget.apply(window, list[i]);
		}
		list = null;
	});
	return {
		widget : function() {
			list.push(arguments);
		}
	};
})();

//histroy接口 兼容处理
(function () {
  // html5 支持
  if ('pushState' in window.history) {
    return;
  }
  var hash;
  // Storage API
  function setStorage(name, value) {
    window.sessionStorage[name] = JSON.stringify(value);
  };

  function getStorage(name) {
    var value = window.sessionStorage[name];
    value = value?value:'{}';
    return JSON.parse(value);
  }

  function changeState (data, title, url, replace) {
    setStorage(url, { state: data, title: title });

    hash = url;

    var href = location.href.replace(location.search,'');
    if(location.search){
        location.href = href+'#'+url;
    }

    if (replace) {
      location.replace('#' + url);
    }
    else {
        location.hash = '#' + url;
    }
  }

  window.history.pushState = function (data, title, url) {
    changeState(data, title, url, false);
  };


  window.history.replaceState = function (data, title, url) {
    changeState(data, title, url, true);
  };


  function get_hash() {
    return location.hash[0] === '#' ?  location.hash.substring(1) : location.hash;
  }

  function hashchange() {
    var new_hash = get_hash(),
        data;

    if (new_hash === hash) {
      return;
    }

    hash = new_hash;
    data = hash ? getStorage(hash) : {};


    if ('onpopstate' in window && typeof window.onpopstate === 'function') {
      window.onpopstate.apply(window, [{ 'state': data ? data.state : null }]);
    }
  };

  if ('onhashchange' in window) {
    window.onhashchange = hashchange;
  }

}());
