/**
 * iu.snippet.js
 *
 * JavaScript 语法高亮
 *
 * */
iu.widget('snippet', {
	init : function() {
		this._createSnippet();
	},
	destroy : function() {
		var self = this;
		self.snippet.remove();
		self.element.css('display', self._display);
	},
	getLanguage : function() {
		return this.options.language || this.element.attr('language') || 'unknown';
	},
	// snippet : null,
	_createSnippet : function() {
		var self = this,
			element = self.element,
			options = self.options,
			language = self.getLanguage(),
			code = options.code || element.html(),
			chunks,
			i, length, html,
			snippet = $('<div class="iu_snippet">'
							+ '<div class="iu_snippet_lines"></div>'
							+ '<div class="iu_snippet_codes"></div>'
						+ '</div>').insertAfter(element),
			lines = snippet.children().first(),
			codes = snippet.children().last();

		self.snippet = snippet;
		self._display = element.get(0).style.display;
		element.hide();

		// special trim
		options.trim ? code = code.replace(/\s+$/, '').replace(/^\n/, '') : 0;

		// align to the first line
		if (options.align) {
			var blanks = code.match(/^([\t ]+)/) || 0;
			blanks[1] ? code = code.replace(/^([\t ]+)/, '').replace(new RegExp('[\t ]*\\n' + blanks[1], 'g'), '\n') : 0;
		}

		options.edit && codes.attr('contentEditable', true);
		options.zebra && snippet.addClass('iu_snippet_zebra');

		chunks = iu.snippet.chunk(code, language).split('\n');
		length = chunks.length;

		// add lines
		if (options.line) {
			html = [];

			for (i = 1, length++; i < length; i++) {
				html.push(i);
			}

			lines.html('<i>' + html.join('.</i><i>') + '.</i>');
			codes.css('padding-left', lines.outerWidth() + (parseFloat(codes.css('padding-left')) || 0));

			length--;
		}

		html = [];
		for (i = 0; i < length; i++) {
			html.push('<pre>' + chunks[i] + '</pre>');
		}

		html = html.join('');

		codes.append($(html));
		codes.addClass('iu_snippet_' + language);
	},
	options : {
		line : true,
		trim : true, // special trim
		align : true, // special align, align to the first line, trim the excess blanks
		edit : false, // code edit
		zebra : false, // code zebra
		language : null, // code language
		code : null // highlight code instead of innerHTML
	}
});

(function() {
	var languages = iu.snippet.languages = {};

	iu.snippet.register = function(name/*'php'*/, language/*{
		keywords : [],
		blocks : [
			{
				name : 'string',
				start : '"', // string|regexp
				end : '"',
				fix : function(str) {
					return str.replace(/(\$[a-z_]\w*)/ig, '<i class="var">$1</i>');
				}
			},
			{
				name : 'string',
				start : '\'',
				end : '\''
			},
			{
				name : 'comment',
				start : '//',
				end : '\n'
			},
			{
				name : 'comment',
				start : '/*',
				end : '*\/',
				fix : function(str) {
					return str.replace(/(@\w+) /g, '<i class="description">$1</i> ')
				}
			}
		]
	}*/) {
		var i, length, block, item,
			blocks = language.blocks || [];
			keywords = language.keywords ? language.keywords.split(' ') : [],
			compiled = languages[name] = {keywords : [], blocks : []};

		for (i = 0, length = blocks.length; i < length; i++) {
			block = blocks[i];

			item = {name : block.name};
			item[block.start.test ? 'reg_start' : 'str_start'] = block.start;
			item[block.end.test ? 'reg_end' : 'str_end'] = block.end;
			block.stop ? item[block.stop.test ? 'reg_stop' : 'str_stop'] = block.stop : 0;
			block.fix ? item.fix = block.fix : 0;
			block.exclude == null ? 0 : item.exclude = block.exclude;

			compiled.blocks.push(item);
		}

		for (i = 0, length = keywords.length; i < length; i++) {
			compiled.keywords.push([new RegExp('\\b' + keywords[i] + '\\b'), keywords[i]]);
		}

		language.filter ? compiled.filter = language.filter : 0;
	};

	iu.snippet.chunk = function(code, language) {
		var chunks,
			i, length, chunk,
			start, end,
			blocks, blocks_length,
			keywords, keywords_length;

		language = languages[language] || {};
		blocks = language.blocks;
		keywords = language.keywords;

		if (blocks && keywords) {
			chunks = [];
			blocks_length = blocks.length;
			keywords_length = keywords.length;
			while (chunk = shiftChunk()) {
				if (chunk.start) {
					pushPlain(code.slice(0, chunk.start));
				}
				if (chunk.name) {
					pushChunk(code.slice(chunk.start, chunk.end), chunk);
				} else {
					pushPlain(code.slice(chunk.start, chunk.end));
				}
				code = code.slice(chunk.end);
			}
			return chunks.join('');
		}

		function shiftChunk() {
			var i,
				tmp,
				chunk = false,
				start,
				end,
				rule,
				find_rule,
				find_start,
				find_str_start,
				find_end,
				find_str_end,
				str_start,
				str_end,
				str_stop;

			if (code) {
				find_start = code.length;

				for (i = 0; i < blocks_length; i++) {
					rule = blocks[i];
					if (rule.str_start) {
						start = code.indexOf(rule.str_start);
						if (start == -1 || start > find_start) {
							continue;
						}
						str_start = rule.str_start;
					} else {
						if (str_start = code.match(rule.reg_start)) {
							start = str_start.index;
							if (start > find_start) {
								continue;
							}
							str_start = str_start[0];
						} else {
							continue;
						}
					}

					find_rule = rule;
					find_start = start;
					find_str_start = str_start;

					tmp = code.slice(start + str_start.length);

					if (rule.str_end) {
						end = tmp.indexOf(rule.str_end);
						if (end > -1) {
							end += rule.str_end.length;
							str_end = rule.str_end;
						}
					} else {
						if (str_end = tmp.match(rule.reg_end)) {
							end = str_end.index + str_end[0].length;
							str_end = str_end[0];
						} else {
							end = -1;
						}
					}

					if (end == -1) {
						if (rule.reg_stop) {
							if (str_stop = tmp.match(rule.reg_stop)) {
								end = str_stop.index + str_stop[0].length;
								str_end = str_stop[0];
							} else {
								end = tmp.length;
								str_end = '';
							}
						} else {
							stop = tmp.indexOf(rule.str_stop);
							if (stop > -1) {
								end = stop;
								str_end = rule.str_stop;
							} else {
								end = tmp.length;
								str_end = '';
							}
						}
					}

					end += start + str_start.length;
					find_str_end = str_end;
				}

				if (find_rule) {
					if ('end' == find_rule.exclude) {
						end -= find_str_end.length;
					} else if ('start' == find_rule.exclude) {
						find_start += find_str_start.length;
					} else if (false === find_rule.exclude) {
						find_start += find_str_start.length;
						end -= find_str_end.length;
					}
					chunk = {
						name : find_rule.name,
						start : find_start,
						end : end,
						fix : find_rule.fix
					}
				} else {
					chunk = {
						start : 0,
						end : code.length
					};
				}
			}
			return chunk;
		}

		function pushPlain(str) {
			if (keywords_length) {
				pushPlain = function(str) {
					for (var i = 0; i < keywords_length; i++) {
						str = str.replace(keywords[i][0], '<i _____="keyword">' + keywords[i][1] + '</i>');
					}
					str = str.replace(/_____/g, 'class');
					language.filter ? str = language.filter(str) : 0;
					chunks.push(str);
				}
			} else {
				pushPlain = function(str) {
					language.filter ? str = language.filter(str) : 0;
					chunks.push(str);
				}
			}

			pushPlain(str);
		}

		function pushChunk(str, chunk) {
			if (chunk.fix) {
				chunks.push('<i class="' + chunk.name + '">' + (chunk.fix(str)).replace(/\n/g, '</i>\n<i class="' + chunk.name + '">') + '</i>');
			} else {
				chunks.push('<i class="' + chunk.name + '">' + str.replace(/\n/g, '</i>\n<i class="' + chunk.name + '">') + '</i>');
			}
		}

		return code;
	};
})();

// iu.snippet.language.css.js
iu.snippet.register('css', {
	keywords : '',
	filter : function(str) {
		return str.replace(/^(\S.*?)\{/, '<i class="selector">$1</i>{');
	},
	blocks : [
		{
			name : 'string',
			start : '"',
			end : '"',
			stop : '\n'
		},
		{
			name : 'string',
			start : '\'',
			end : '\'',
			stop : '\n'
		},
		{
			name : 'comment',
			start : '/*',
			end : '*/'
		},
		{
			name : 'at',
			start : '@',
			end : /[^a-z-]/i,
			exclude : 'end'
		},
		{
			name : 'selector',
			start : /[a-z#.:\[]/i,
			end : '{',
			stop : '\n',
			exclude : 'end',
			fix : function(str) {
				return str
						.replace(/(['"][a-z]+['"])/gi, '<i class="string">$1</i>')
						.replace(/(:[a-z-]+)/gi, '<i class="pseudo">$1</i>')
			}
		},
		{
			name : 'block',
			start : '{',
			end : '}',
			fix : function(str) {
				return str
						.replace(/(['"].*?['"])/, '<i class="string">$1</i>')
						.replace(/(#[0-9a-f]{3})\b/gi, '<i class="color">$1</i>')
						.replace(/(#[0-9a-f]{6})\b/gi, '<i class="color">$1</i>')
						.replace(/(:\s*)([a-z][a-z-]+)\b(\s*[^(])/gi, '$1<i class="value">$2</i>$3')
						.replace(/\((.*?)\)/g, '(<i class="string">$1</i>)')
						.replace(/([a-z]+)(\s*\()/gi, '<i class="function">$1</i>$2')
						.replace(/(^|\s+)([a-z-]+\s*:)/gi, '$1<i class="property">$2</i>');
			}
		}
	]
});

// iu.snippet.language.javascript.js
iu.snippet.register('javascript', {
	keywords : 'break case catch continue default delete do else finally for function if in instanceof new return switch this throw try typeof var void while with abstract boolean byte char class const debugger double enum export extends fimal float goto implements import int interface long mative package private protected public short static super synchronized throws transient volatile',
	filter : function(str) {
		return str.replace(/([a-z_]\w+)\(/gi, '<i class="function">$1</i>(');
	},
	blocks : [
		{
			name : 'string',
			start : '"',
			end : '"',
			stop : '\n' // end-string is not found before stop-string, close this end. a little self-correcting
		},
		{
			name : 'string',
			start : '\'',
			end : '\'',
			stop : '\n'
		},
		{
			name : 'comment',
			start : '//',
			end : '\n'
		},
		{
			name : 'comment',
			start : '/*',
			end : '*/',
			fix : function(str) {
				return str.replace(/(@\w+)/g, '<i class="description">$1</i>');
			}
		}
	]
});

// iu.snippet.language.php.js
iu.snippet.register('php', {
	keywords : 'and or xor exception array as break case class const continue declare default die do echo else elseif empty enddeclare endfor endforeach endif endswitch endwhile eval exit extends for foreach function global if include include_once isset list new print require require_once return static switch unset use var while final php_user_filter interface implements extends public private protected abstract clone try catch throw cfunction this',
	filter : function(str) {
		return str
				.replace(/([A-Z_][A-Z][A-Z_]+)([^:])/g, '<i class="const">$1</i>$2')
				.replace(/(\w+::)/g, '<i class="class">$1</i>')
				.replace(/([a-z_]\w+)\(/gi, '<i class="function">$1</i>(')
				.replace(/(\$[a-z_]\w+)/gi, '<i class="variable">$1</i>');
	},
	blocks : [
		{
			name : 'string',
			start : '"',
			end : '"',
			fix : function(str) {
				return str.replace(/(\$[a-z_]\w+)/g, '<i class="variable">$1</i>');
			}
		},
		{
			name : 'string',
			start : '\'',
			end : '\''
		},
		{
			name : 'comment',
			start : '#',
			end : '\n'
		},
		{
			name : 'comment',
			start : '//',
			end : '\n'
		},
		{
			name : 'comment',
			start : '/*',
			end : '*/',
			fix : function(str) {
				return str.replace(/(@\w+)/g, '<i class="description">$1</i>');
			}
		}
	]
});