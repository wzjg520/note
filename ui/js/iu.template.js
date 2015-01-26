/**
 * iu.template.js
 *
 * iu.template is a special widget of iu
 *
 * 模板语法与 JavaScript 语法基本保持一致
 * 
 * 变量和表达式边界预定使用 '{', '}'
 * 
 * iu.template.setDelimiter(right, left) // 修改边界符
 * iu.template.setEscape(true) // 转义 html special chars
 * 
 * 注意：假设边界符为 '{', '}', 而确实需要 {abc}, 则需要转移 => {#abc}, 就会被展示为 {abc}, 而不被当做模板变量
 *
 * @example
 *
 * iu.template(tmpl) => object view, view.render(data) => rendered str
 * iu.template(tmpl, data) => rendered str
 *
 * */
iu.template = function(tmpl, data, exit) {
	var tmpl_funcs = {
			'if' 		: {level : 1, prefix : 'if(', suffix : '){'},
			'elseif' 	: {level : 0, prefix : '}else if(', suffix : '){'},
			'else' 		: {level : 0, prefix : '}else{', suffix : ''},
			'/if' 		: {level : -1, prefix : '', suffix : '}'},
			'for' 		: {level : 1, prefix : '_FOR_COUNTER++;_FOR_ELSE[_FOR_COUNTER]=1;for(', suffix : '){_FOR_ELSE[_FOR_COUNTER]=0;', fix : function(exp) {
				var tmpl = '', for_items;
				exp = exp.replace(/^\s+|\s+$/, '');

				if (/ in /.test(exp)) {
					// for in
					for_items = exp.split(' in ');
					tmpl = tmpl + this.prefix + exp + this.suffix + 'key=' + for_items[0] + ';' + for_items[0] + ' = ' + for_items[1] + '[key];';
				} else{
					// for ;;
					tmpl = tmpl + this.prefix + exp + this.suffix;
				}

				return tmpl;
			}},
			'forelse' 	: {level : 0, prefix : '} if(_FOR_ELSE[_FOR_COUNTER]){', suffix : ''},
			'/for' 		: {level : -1, prefix : '', suffix : '}_FOR_COUNTER--;'},
			'var' 		: {level : 0, prefix : 'var ', suffix : ';'},
			'while' 	: {level : 1, prefix : 'while(', suffix : '){'},
			'/while' 	: {level : -1, prefix : '', suffix : '}'},
			'exp'		: {level : 0, prefix : '', suffix : ';'}
		},
		tmpl_keywords = /^\/*\bif|elseif|else|for|forelse|var|while|exp\b/,

		cache = {}, // views cache

		// prefer delimiter
		rplains, rkeywords, rborders, rrecoverblank, recoverblank,
		rblanks, rblanks_left, blanks, blanks_left,
		rescape, escape,

		reserved = (function() {
			// JavaScript 保留字, 不能在模板中使用
			var arr = 'break,delete,function,return,typeof,case,do,if,switch,var,catch,else,in,this,void,continue,false,instanceof,throw,while,debugger,finally,new,true,with,default,for,null,try,abstract,double,goto,native,static,boolean,enum,implements,package,super,byte,export,import,private,synchronized,char,extends,int,protected,throws,class,final,interface,public,transient,const,float,long,short,volatile'.split(',');

			for (var reserved = {}, i = 0, length = arr.length; i < length; i++) {
				reserved[arr[i]] = 1;
			}

			return reserved;
		})();

	function setDelimiter(left, right) { if (left && right) {
		rplains = new RegExp(left + '\\s*[a-zA-Z\\\/]{1}[\\w\\d\\s\\/\\[\\]\\(\\)\\|!&+*%<>\"\';,._=-]*' + right);
		rkeywords = new RegExp(left + '\\s*[a-zA-Z\\\/]{1}[\\w\\d\\s\\/\\[\\]\\(\\)\\|!&+*%<>\"\';,._=-]*' + right, 'g');
		rborders = new RegExp(left + '\\s*|\\s*' + right, 'g');
		rrecoverblank = new RegExp(right + left, 'g');
		recoverblank = right + ' ' + left;

		rblanks = new RegExp(right + '\\s+' + left, 'g');
		blanks = right + left;

		rblanks_left = new RegExp('\\s*\\n\\s*' + left, 'g');
		blanks_left = left;

		rescape = new RegExp(left + '#(\\w+)' + right, 'g');
		escape = left + '$1' + right;
	}}

	setDelimiter('{', '}');

	function template(str, data, exit) {
		var str_back = str, tmpl = '', level, plains, keywords, exp, match, i, length, filter, vars, vars_str, view;
		
		if (null != cache[str_back]) {
			return arguments.length > 1 ? cache[str_back].render(data, exit) : cache[str_back];
		}
		
		if (str && typeof str == 'string') {
			level = 0;
			vars = {};
			vars_str = '';

			// replace blanks
			str = str.replace(rblanks, blanks).replace(rblanks_left, blanks_left);

			// 兼容 TrimPath
			// str = str.replace(/\$\{/g, '{');

			// 过滤模板注释, 模板注释采用 html 注释
			str = str.replace(/\n?\s*\<\!\-\-(.*?)\-\-\>/g, '');

			str = beforeRender(str);
			iu.support.keepblank ? 0 : str = str.replace(rrecoverblank, recoverblank);

			plains = str.split(rplains);
			keywords = str.match(rkeywords);

			if (keywords) {
				length = keywords.length;
				if (length < plains.length) {
					// 表达式被包围
					tmpl = tmpl + '_TPH(\'' + addSlash(plains.shift()) + '\');';
				} else if (/\s*\{/.test(str)) {
					// 表达式在前
				} else {
					// 表达式在后
					tmpl = tmpl + '_TPH("' + addSlash(plains[i]) + '");';
					plains.push('');
				}

				for (i = 0; i < length; i++) {
					// keywords or expression
					match = keywords[i].replace(rborders, '');

					if (tmpl_keywords.test(match)) {
						// 表达式
						exp = match.match(/([^\s]+)\s+(.+)/);
						
						if (exp) {
							filter = tmpl_funcs[exp[1]];
							undefined === exp[2] ? exp[2] = '' : ''; 
							level = level + filter.level;

							// 表达式中不能包含括号
							if ('(' == exp[2][0]) {
								exp[2] = exp[2].replace(/^\(/, '').replace(/\)$/, '');
							}

							if (filter.fix) {
								tmpl = tmpl + filter.fix(exp[2]);
							} else{
								tmpl = tmpl + filter.prefix + exp[2] + filter.suffix;
							}

							//filter.getVars ? addVars(filter.getVars(exp)) : '';
							exp = exp[2].match(/\b[a-z_][a-z0-9_]+\b/ig);
							exp ? addVars(exp) : '';
						} else if (tmpl_funcs[match]) {
							// else /if, /for, /while
							filter = tmpl_funcs[match];
							level = level + filter.level;

							tmpl = tmpl + filter.prefix + filter.suffix;
						} else {
							exp = match.match(/\b[a-z_][a-z0-9_]+\b/ig);
							exp ? addVars(exp) : '';
							tmpl = tmpl + '_TPH(_TPE(' + match + '));';
							// return template.error('not exist', match);
						}
					} else {
						// simple variable
						tmpl = tmpl + '_TPH(_TPE(' + match + '));';

						addVars(match.match(/\b[a-z_][a-z0-9_]*\b/ig));
					}

					tmpl = tmpl + '_TPH(\'' + addSlash(plains[i].replace(rescape, escape)) + '\');';
				}
			} else {
				tmpl = '_TPH(\'' + addSlash(plains[0].replace(rescape, escape)) + '\');';
			}
			
			if (level) {
				return template.error('not match');
			}

			for (i in vars) {
				vars_str = vars_str + i + '=_TPD.' + i + ',';
			}

			if (vars_str) {
				vars_str = 'var _TPD=arguments[0]||{},' + vars_str + 'key,_FOR_ELSE=[],_FOR_COUNTER=0;'
				tmpl = vars_str + tmpl;
			}
		}

		function addVars(list) {
			for (var i = 0, length = list ? list.length : 0; i < length; i++) {
				reserved[list[i]] ? '' : vars[list[i]] = 1;
			}
		}
		
		view = cache[str_back] = new View(tmpl);

		return arguments.length > 1 ? view.render(data, exit) : view;
	}

	function View(tmpl) {
		this.render = function(data, exit) {
			iu.template.eval(this.fn, data, exit);
			return iu.template.s.join ? iu.template.s.join('') : iu.template.s;
		};
		// 兼容 TrimPath
		this.process = this.render;

		this.tmpl = 'iu.template.s=[];var _TPE=iu.template.escape,_TPH=iu.template.push;' + tmpl;
		this.fn = new Function(this.tmpl);
	}

	function setEscape(escape) {
		template.escape = escape ? function (arg0) {
										if (typeof arg0 == 'string') {
											return arg0.replace(/&/g, '&amp;')
														.replace(/"/g, '&quot;')
														.replace(/'/g, '&#039;')
														.replace(/</g, '&lt;')
														.replace(/>/g, '&gt;');
										}

										return arg0;
									} : function (arg0) {
										return arg0;
									};
	}

	setEscape(true);

	function addSlash(str) {
		return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\r?\n/g, '\\n').replace(/\//g, '\\\/');
	}

	// string replace before render
	function beforeRender(str) {
		var replaces = iu.template.filters;

		for (var i = 0, length = replaces.length; i < length; i++) {
			str = str.replace(replaces[i][0], replaces[i][1]);
		}

		return str;
	}

	template.error = function(type, extra) {
		switch (type) {
		case 'not match':
			throw new Error('Template error : "{" and "}" do not match.');
		case 'not exist' : 
			throw new Error('Template error : "' + extra + '" is not supported.');
		case 'run' : {
			if (extra.exit) {
				throw new Error(extra.data);
			} else {
				console.error('Template error : ', extra.data.message + '.');
			}
			break;
		}
		case 'no data' : {
			console.error('Template error : View.render(data) no data received.');
			break;
		}
		default:
			throw new Error('Template error : Unknown error.');
		}
	};

	template.push = !window.ActiveXObject && /MSIE [5-8]/.test(navigator.userAgent) ? function(s) {
		s == null || template.s.push(s);
	} : function(s) {
		s == null ? 0 : template.s += s;
		// s == null || template.s.push(s);
	};

	template.setDelimiter = setDelimiter;
	template.setEscape = setEscape;

	return template;
}();

iu.template.filters = [[/\\/g, '\\\\'], [/&lt;/g, '<'], [/&gt;/g, '>'], [/&amp;/g, '&']];

// don't call the next function if you don't know how to use it
iu.template.eval = function() {
	var args = arguments;
	try {
		return args[0](args[1]);
	} catch (e) {
		iu.template.error('run', {data : e, exit : args[2]});
	}
};