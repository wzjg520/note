/**
 * iu.uploader.js
 * */
iu.widget('uploader', {
	init: function() {
		if (!iu.uploader.drag) {
			iu.uploader.drag = IU_UPLOADER_DRAG;
			IU_UPLOADER_DRAG = undefined;
		}
		this._createUploader();
	},
	destroy: function() {
		var self = this, clone, id;
		if (clone = self._clone) {
			if (id = clone.attr('data-id')) {
				clone.attr('id', id).removeAttr('data-id');
			}
			if (id = clone.attr('data-position')) {
				clone.css('position', id).removeAttr('data-position');
			}
			clone.before(self.element).remove();
		}
		if (self.uploader) {
			self.uploader.remove();
		}
	},
	setOption: function(key, value) {
		if ('title' == key) {
			if (this._swf) {
				return;
			}
			this.uploader.attr('title', value);
			this._file.attr('title', value);
		}
	},
	upload: function(id) {
		var self = this, list, uploadQueue;

		if (id) {
			self._submitItem(id);
			return;
		}

		list = self._queue.children('.iu_uploader_todo');

		if (self._swf) {
			// swf
			self._swf.startUpload();
		} else if (self._form) {
			// iframe form
			// 一层闭包: 1, 上传文件列表
			uploadQueue = function(list) {
				var item, index, id, file;
				if (item = list.shift()) {
					item = $(item);
					index = item.attr('data-index');
					file = item.find('.iu_uploader_file')[0];

					id = index;
					name = file.value.substr(file.value.lastIndexOf('\\') + 1);

					if (false === self.__submit(id, name)) {
						return false;
					}

					self._submitForm(id, name, file, function(response) {
						self.__complete(id, name, response);
						item.removeClass('iu_uploader_todo');
						uploadQueue(list);
					});
				}
			};
			uploadQueue(list.toArray());
		} else {
			// ajax
			// 两层闭包: 1, 上传文件列表; 2 上传单个 input 的 Files 列表
			uploadQueue = function(list) {
				var item, index, counter, file;
				if (item = list.shift()) {
					item = $(item);
					index = item.attr('data-index');
					counter = 0;

					function uploadList(files) {
						var file, id, name;
						if (file = files.shift()) {
							id = index + '_' + counter;
							name = file.name;
							counter++;

							if (false === self.__submit(id, name)) {
								return false;
							}

							self._submitXhr(id, name, file, function(response) {
								self.__complete(id, name, response);
								uploadList(files);
							});
						} else {
							item.removeClass('iu_uploader_todo');
							uploadQueue(list);
						}
					}

					file = item.find('.iu_uploader_file')[0];
					uploadList(iu.tool.toArray(file._dragFiles || file.files));
				}
			};
			uploadQueue(list.toArray());
		}
	},
	cancel : function(id) {
		var xhr = this._submits[id];
		if (xhr) {
			xhr.abort();
			return true;
		}
		return false;
	},
	clearFile: function() {
		var self = this,
			file = self._file;

		if (file[0]._dragFiles) {
			delete file[0]._dragFiles;
		}
		file.unbind('click,change').val('');

		self._file = file.clone(true)
			.insertAfter(file)
			.bind('click', self.events.click)
			.bind('change', self.events.change);

		file.remove();
	},
	clearQueue : function() {
		this._queue.children().remove();
	},
	_submitItem : function(id) {
		var self = this,
			files,
			file,
			list,
			item,
			tmp,
			index,
			counter;

		tmp = id.split('_');
		index = tmp[0];
		counter = tmp[1];

		if (self._swf) {
			return;
		}

		list = self._queue.children();
		item = list.eq(index);

		if (item.length) {
			file = item.find('.iu_uploader_file')[0];
			if (self._form) {
				name = file.value.substr(file.value.lastIndexOf('\\') + 1);

				if (false === self.__submit(id, name)) {
					return false;
				}

				self._submitForm(id, name, file, function(response) {
					self.__complete(id, name, response);
					item.removeClass('iu_uploader_todo');
				});
			} else {
				files = file._dragFiles || file.files;
				file = files[counter];
				if (file) {
					name = file.name;

					if (false === self.__submit(id, name)) {
						return false;
					}

					self._submitXhr(id, name, file, function(response) {
						self.__complete(id, name, response);
						if (files.length == 1) {
							item.removeClass('iu_uploader_todo');
						}
					});
				}
			}
		}
	},
	_submits : {},
	_submitForm : function(id, name, file, complete) {
		var self = this, form, iframe, parent = file.parentNode, target;
		if (parent.tagName == 'LI') {
			parent = $(parent);
			target = 'iu_uploader_' + (new Date).getTime();
			form = $('<form target="' + target + '" method="post" enctype="multipart/form-data"></form>');
			iframe = $('<iframe name="' + target + '"></iframe>');
			parent.append(form).append(iframe);
			form.append(file).attr('action', self.options.url);
		} else {
			parent = $(parent.parentNode);
			form = parent.find('form');
			iframe = parent.find('iframe');
		}

		iframe[0].onload = function() {
			if (self.options.progress) {
				// form 表单提交无法提供文件上传进度, loaded, total 是无效的数字
				self.__progress(id, name, 1, 1, 1);
			}
			complete(this.contentWindow.document.body.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
		};
		form.submit();
	},
	_submitXhr : function(id, name, file, complete) {
		var self = this,
			options = self.options,
			url = options.url,
			xhr = new XMLHttpRequest(),
			state,
			precious_time,
			progress;

		if (options.progress) {
			precious_time = +new Date;
			progress = function(loaded, total) {
				var time = +new Date, percent = parseInt(loaded / total * 100) / 100;
				// excute each 100 ms
				if (time - precious_time > 99 || percent == 1) {
					precious_time = time;
					self.__progress(id, name, loaded, total, percent);
				}
			};
		}

		url += (~url.indexOf('?') ? '&' : '?') + 'iu_uploader_file=' + encodeURIComponent(file.name);

		xhr.onabort = function() {
			self.__cancel(id, name);
		};

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.readyState != state && xhr.status >= 200) {
				state = xhr.readyState;
				delete self._submits[id];
				complete(xhr.responseText);
			}
		};

		if (xhr.upload && progress) {
			xhr.upload.onprogress = function(e) {
				if (e.lengthComputable) {
					progress(e.loaded, e.total);
				}
			};
		}

		xhr.open('POST', url, options.async);
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.setRequestHeader('Cache-Control', 'no-cache');
		xhr.setRequestHeader('Content-Type', 'application/octet-stream');
		xhr.send(file);

		self._submits[id] = xhr;
	},
	_drop : function(e) {
		var self = this;
		self._file[0]._dragFiles = e.dataTransfer.files;
		self.events.change(e);
	},
	// uploader : null,
	// _clone : null,
	// _file : null,
	// _form : null,
	// _iframe : null,
	// _extension : null,
	// _swf : null,
	// _queue : null,
	_index : 0,
	_createUploader: function() {
		var self = this,
			options = self.options,
			uploader = $('<div class="iu_uploader" style="position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden">'
							+ '<ul class="iu_uploader_queue" style="display:none"></ul>'
						+'</div>'),
			noop = iu.tool.noop;

		self.element.append(uploader);
		options.title && uploader.attr('title', options.title);

		self.uploader = uploader;
		self._queue = uploader.find('.iu_uploader_queue');
		self._extension = (function() {
			if (options.extension && options.extension != '*') {
				var extension = {};
				iu.tool.each(options.extension.split(','), function(ext) {
					extension[ext.toLowerCase()] = 1;
				});
				return extension;
			}
		})();

		var i, length, etag, etags = 'click,change,validate,submit,progress,cancel,complete,success,error'.split(',');
		for (i = 0, length = etags.length; i < length; i++) {
			etag = etags[i];
			self['__' + etag] = iu.tool.type(options[etag], 'function') ? options[etag] : noop;
		}

		/*self.__click = iu.tool.type(options.click, 'function') ? options.click : noop;
		self.__change = iu.tool.type(options.change, 'function') ? options.change : noop;
		self.__validate = iu.tool.type(options.validate, 'function') ? options.validate : noop;
		self.__submit = iu.tool.type(options.submit, 'function') ? options.submit : noop;
		self.__progress = iu.tool.type(options.progress, 'function') ? options.progress : noop;
		self.__cancel = iu.tool.type(options.cancel, 'function') ? options.cancel : noop;
		self.__complete = iu.tool.type(options.complete, 'function') ? options.complete : noop;
		self.__success = iu.tool.type(options.success, 'function') ? options.success : noop;
		self.__error = iu.tool.type(options.error, 'function') ? options.error : noop;*/

		self._createButton();
	},
	_createButton: function() {
		var self = this,
			options = self.options,
			element = self.element,
			position = element[0].style.position,
			file;

		if (position) {
			element.attr('data-position', position);
		}

		if (!window.File && (options.multiple && options.swf && window.SWFUpload)) {
			// require flash
			self.uploader.remove();
			self._createButtonSwf();
		} else {
			// name="iu_uploader_file[]"
			file = $('<input class="iu_uploader_file" name="iu_uploader_file" type="file" tabindex="-1" style="position:absolute;top:0;right:0;font-family:Arial;font-size:118px;margin:0;padding:0;opacity:0;filter:alpha(opacity=0);cursor:pointer"/>');

			file
				.bind('click', self.events.click)
				.bind('change', self.events.change)
				.attr('accept', getAccept(options.extension));

			options.multiple ? file.attr('multiple', 'multiple') : 0;
			options.title ? file.attr('title', options.title) : 0;

			if (self.element.css('position') == 'static') {
				self.element.css('position', 'relative');
			}

			self.uploader.append(file);

			self._form = !window.File;
			self._file = file;

			if (!self._form && (options.dragenter || options.dragleave || options.drop)) {
				iu.uploader.drag.init(self);
			}
		}

		function getAccept(extension) {
			var accept = [], i, length;
			var mime = {'323': 'text/h323', '3gp': 'video/3gpp', aab: 'application/x-authoware-bin', aam: 'application/x-authoware-map', aas: 'application/x-authoware-seg', acx: 'application/internet-property-stream', ai: 'application/postscript', aif: 'audio/x-aiff', aifc: 'audio/x-aiff', aiff: 'audio/x-aiff', als: 'audio/X-Alpha5', amc: 'application/x-mpeg', ani: 'application/octet-stream', apk: 'application/vnd.android.package-archive', asc: 'text/plain', asd: 'application/astound', asf: 'video/x-ms-asf', asn: 'application/astound', asp: 'application/x-asap', asr: 'video/x-ms-asf', asx: 'video/x-ms-asf', au: 'audio/basic', avb: 'application/octet-stream', avi: 'video/x-msvideo', awb: 'audio/amr-wb', axs: 'application/olescript', bas: 'text/plain', bcpio: 'application/x-bcpio', bin: 'application/octet-stream', bld: 'application/bld', bld2: 'application/bld2', bmp: 'image/bmp', bpk: 'application/octet-stream', bz2: 'application/x-bzip2', c: 'text/plain', cal: 'image/x-cals', cat: 'application/vnd.ms-pkiseccat', ccn: 'application/x-cnc', cco: 'application/x-cocoa', cdf: 'application/x-cdf', cer: 'application/x-x509-ca-cert', cgi: 'magnus-internal/cgi', chat: 'application/x-chat', 'class': 'application/octet-stream', clp: 'application/x-msclip', cmx: 'image/x-cmx', co: 'application/x-cult3d-object', cod: 'image/cis-cod', conf: 'text/plain', cpio: 'application/x-cpio', cpp: 'text/plain', cpt: 'application/mac-compactpro', crd: 'application/x-mscardfile', crl: 'application/pkix-crl', crt: 'application/x-x509-ca-cert', csh: 'application/x-csh', csm: 'chemical/x-csml', csml: 'chemical/x-csml', css: 'text/css', cur: 'application/octet-stream', dcm: 'x-lml/x-evm', dcr: 'application/x-director', dcx: 'image/x-dcx', der: 'application/x-x509-ca-cert', dhtml: 'text/html', dir: 'application/x-director', dll: 'application/x-msdownload', dmg: 'application/octet-stream', dms: 'application/octet-stream', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', dot: 'application/msword', dvi: 'application/x-dvi', dwf: 'drawing/x-dwf', dwg: 'application/x-autocad', dxf: 'application/x-autocad', dxr: 'application/x-director', ebk: 'application/x-expandedbook', emb: 'chemical/x-embl-dl-nucleotide', embl: 'chemical/x-embl-dl-nucleotide', eps: 'application/postscript', epub: 'application/epub+zip', eri: 'image/x-eri', es: 'audio/echospeech', esl: 'audio/echospeech', etc: 'application/x-earthtime', etx: 'text/x-setext', evm: 'x-lml/x-evm', evy: 'application/envoy', exe: 'application/octet-stream', fh4: 'image/x-freehand', fh5: 'image/x-freehand', fhc: 'image/x-freehand', fif: 'application/fractals', flr: 'x-world/x-vrml', flv: 'flv-application/octet-stream', fm: 'application/x-maker', fpx: 'image/x-fpx', fvi: 'video/isivideo', gau: 'chemical/x-gaussian-input', gca: 'application/x-gca-compressed', gdb: 'x-lml/x-gdb', gif: 'image/gif', gps: 'application/x-gps', gtar: 'application/x-gtar', gz: 'application/x-gzip', h: 'text/plain', hdf: 'application/x-hdf', hdm: 'text/x-hdml', hdml: 'text/x-hdml', hlp: 'application/winhlp', hqx: 'application/mac-binhex40', hta: 'application/hta', htc: 'text/x-component', htm: 'text/html', html: 'text/html', hts: 'text/html', htt: 'text/webviewhtml', ice: 'x-conference/x-cooltalk', ico: 'image/x-icon', ief: 'image/ief', ifm: 'image/gif', ifs: 'image/ifs', iii: 'application/x-iphone', imy: 'audio/melody', ins: 'application/x-internet-signup', ips: 'application/x-ipscript', ipx: 'application/x-ipix', isp: 'application/x-internet-signup', it: 'audio/x-mod', itz: 'audio/x-mod', ivr: 'i-world/i-vrml', j2k: 'image/j2k', jad: 'text/vnd.sun.j2me.app-descriptor', jam: 'application/x-jam', jar: 'application/java-archive', java: 'text/plain', jfif: 'image/pipeg', jnlp: 'application/x-java-jnlp-file', jpe: 'image/jpeg', jpeg: 'image/jpeg', jpg: 'image/jpeg', jpz: 'image/jpeg', js: 'application/x-javascript', jwc: 'application/jwc', kjx: 'application/x-kjx', lak: 'x-lml/x-lak', latex: 'application/x-latex', lcc: 'application/fastman', lcl: 'application/x-digitalloca', lcr: 'application/x-digitalloca', lgh: 'application/lgh', lha: 'application/octet-stream', lml: 'x-lml/x-lml', lmlpack: 'x-lml/x-lmlpack', log: 'text/plain', lsf: 'video/x-la-asf', lsx: 'video/x-la-asf', lzh: 'application/octet-stream', m13: 'application/x-msmediaview', m14: 'application/x-msmediaview', m15: 'audio/x-mod', m3u: 'audio/x-mpegurl', m3url: 'audio/x-mpegurl', m4a: 'audio/mp4a-latm', m4b: 'audio/mp4a-latm', m4p: 'audio/mp4a-latm', m4u: 'video/vnd.mpegurl', m4v: 'video/x-m4v', ma1: 'audio/ma1', ma2: 'audio/ma2', ma3: 'audio/ma3', ma5: 'audio/ma5', man: 'application/x-troff-man', map: 'magnus-internal/imagemap', mbd: 'application/mbedlet', mct: 'application/x-mascot', mdb: 'application/x-msaccess', mdz: 'audio/x-mod', me: 'application/x-troff-me', mel: 'text/x-vmel', mht: 'message/rfc822', mhtml: 'message/rfc822', mi: 'application/x-mif', mid: 'audio/mid', midi: 'audio/midi', mif: 'application/x-mif', mil: 'image/x-cals', mio: 'audio/x-mio', mmf: 'application/x-skt-lbs', mng: 'video/x-mng', mny: 'application/x-msmoney', moc: 'application/x-mocha', mocha: 'application/x-mocha', mod: 'audio/x-mod', mof: 'application/x-yumekara', mol: 'chemical/x-mdl-molfile', mop: 'chemical/x-mopac-input', mov: 'video/quicktime', movie: 'video/x-sgi-movie', mp2: 'video/mpeg', mp3: 'audio/mpeg', mp4: 'video/mp4', mpa: 'video/mpeg', mpc: 'application/vnd.mpohun.certificate', mpe: 'video/mpeg', mpeg: 'video/mpeg', mpg: 'video/mpeg', mpg4: 'video/mp4', mpga: 'audio/mpeg', mpn: 'application/vnd.mophun.application', mpp: 'application/vnd.ms-project', mps: 'application/x-mapserver', mpv2: 'video/mpeg', mrl: 'text/x-mrml', mrm: 'application/x-mrm', ms: 'application/x-troff-ms', msg: 'application/vnd.ms-outlook', mts: 'application/metastream', mtx: 'application/metastream', mtz: 'application/metastream', mvb: 'application/x-msmediaview', mzv: 'application/metastream', nar: 'application/zip', nbmp: 'image/nbmp', nc: 'application/x-netcdf', ndb: 'x-lml/x-ndb', ndwn: 'application/ndwn', nif: 'application/x-nif', nmz: 'application/x-scream', 'nokia-op-logo': 'image/vnd.nok-oplogo-color', npx: 'application/x-netfpx', nsnd: 'audio/nsnd', nva: 'application/x-neva1', nws: 'message/rfc822', oda: 'application/oda', ogg: 'audio/ogg', oom: 'application/x-AtlasMate-Plugin', p10: 'application/pkcs10', p12: 'application/x-pkcs12', p7b: 'application/x-pkcs7-certificates', p7c: 'application/x-pkcs7-mime', p7m: 'application/x-pkcs7-mime', p7r: 'application/x-pkcs7-certreqresp', p7s: 'application/x-pkcs7-signature', pac: 'audio/x-pac', pae: 'audio/x-epac', pan: 'application/x-pan', pbm: 'image/x-portable-bitmap', pcx: 'image/x-pcx', pda: 'image/x-pda', pdb: 'chemical/x-pdb', pdf: 'application/pdf', pfr: 'application/font-tdpfr', pfx: 'application/x-pkcs12', pgm: 'image/x-portable-graymap', pict: 'image/x-pict', pko: 'application/ynd.ms-pkipko', pm: 'application/x-perl', pma: 'application/x-perfmon', pmc: 'application/x-perfmon', pmd: 'application/x-pmd', pml: 'application/x-perfmon', pmr: 'application/x-perfmon', pmw: 'application/x-perfmon', png: 'image/png', pnm: 'image/x-portable-anymap', pnz: 'image/png', 'pot,': 'application/vnd.ms-powerpoint', ppm: 'image/x-portable-pixmap', pps: 'application/vnd.ms-powerpoint', ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', pqf: 'application/x-cprplayer', pqi: 'application/cprplayer', prc: 'application/x-prc', prf: 'application/pics-rules', prop: 'text/plain', proxy: 'application/x-ns-proxy-autoconfig', ps: 'application/postscript', ptlk: 'application/listenup', pub: 'application/x-mspublisher', pvx: 'video/x-pv-pvx', qcp: 'audio/vnd.qcelp', qt: 'video/quicktime', qti: 'image/x-quicktime', qtif: 'image/x-quicktime', r3t: 'text/vnd.rn-realtext3d', ra: 'audio/x-pn-realaudio', ram: 'audio/x-pn-realaudio', rar: 'application/octet-stream', ras: 'image/x-cmu-raster', rc: 'text/plain', rdf: 'application/rdf+xml', rf: 'image/vnd.rn-realflash', rgb: 'image/x-rgb', rlf: 'application/x-richlink', rm: 'audio/x-pn-realaudio', rmf: 'audio/x-rmf', rmi: 'audio/mid', rmm: 'audio/x-pn-realaudio', rmvb: 'audio/x-pn-realaudio', rnx: 'application/vnd.rn-realplayer', roff: 'application/x-troff', rp: 'image/vnd.rn-realpix', rpm: 'audio/x-pn-realaudio-plugin', rt: 'text/vnd.rn-realtext', rte: 'x-lml/x-gps', rtf: 'application/rtf', rtg: 'application/metastream', rtx: 'text/richtext', rv: 'video/vnd.rn-realvideo', rwc: 'application/x-rogerwilco', s3m: 'audio/x-mod', s3z: 'audio/x-mod', sca: 'application/x-supercard', scd: 'application/x-msschedule', sct: 'text/scriptlet', sdf: 'application/e-score', sea: 'application/x-stuffit', setpay: 'application/set-payment-initiation', setreg: 'application/set-registration-initiation', sgm: 'text/x-sgml', sgml: 'text/x-sgml', sh: 'application/x-sh', shar: 'application/x-shar', shtml: 'magnus-internal/parsed-html', shw: 'application/presentations', si6: 'image/si6', si7: 'image/vnd.stiwap.sis', si9: 'image/vnd.lgtwap.sis', sis: 'application/vnd.symbian.install', sit: 'application/x-stuffit', skd: 'application/x-Koan', skm: 'application/x-Koan', skp: 'application/x-Koan', skt: 'application/x-Koan', slc: 'application/x-salsa', smd: 'audio/x-smd', smi: 'application/smil', smil: 'application/smil', smp: 'application/studiom', smz: 'audio/x-smd', snd: 'audio/basic', spc: 'application/x-pkcs7-certificates', spl: 'application/futuresplash', spr: 'application/x-sprite', sprite: 'application/x-sprite', sdp: 'application/sdp', spt: 'application/x-spt', src: 'application/x-wais-source', sst: 'application/vnd.ms-pkicertstore', stk: 'application/hyperstudio', stl: 'application/vnd.ms-pkistl', stm: 'text/html', svg: 'image/svg+xml', sv4cpio: 'application/x-sv4cpio', sv4crc: 'application/x-sv4crc', svf: 'image/vnd', svg: 'image/svg+xml', svh: 'image/svh', svr: 'x-world/x-svr', swf: 'application/x-shockwave-flash', swfl: 'application/x-shockwave-flash', t: 'application/x-troff', tad: 'application/octet-stream', talk: 'text/x-speech', tar: 'application/x-tar', taz: 'application/x-tar', tbp: 'application/x-timbuktu', tbt: 'application/x-timbuktu', tcl: 'application/x-tcl', tex: 'application/x-tex', texi: 'application/x-texinfo', texinfo: 'application/x-texinfo', tgz: 'application/x-compressed', thm: 'application/vnd.eri.thm', tif: 'image/tiff', tiff: 'image/tiff', tki: 'application/x-tkined', tkined: 'application/x-tkined', toc: 'application/toc', toy: 'image/toy', tr: 'application/x-troff', trk: 'x-lml/x-gps', trm: 'application/x-msterminal', tsi: 'audio/tsplayer', tsp: 'application/dsptype', tsv: 'text/tab-separated-values', ttf: 'application/octet-stream', ttz: 'application/t-time', txt: 'text/plain', uls: 'text/iuls', ult: 'audio/x-mod', ustar: 'application/x-ustar', uu: 'application/x-uuencode', uue: 'application/x-uuencode', vcd: 'application/x-cdlink', vcf: 'text/x-vcard', vdo: 'video/vdo', vib: 'audio/vib', viv: 'video/vivo', vivo: 'video/vivo', vmd: 'application/vocaltec-media-desc', vmf: 'application/vocaltec-media-file', vmi: 'application/x-dreamcast-vms-info', vms: 'application/x-dreamcast-vms', vox: 'audio/voxware', vqe: 'audio/x-twinvq-plugin', vqf: 'audio/x-twinvq', vql: 'audio/x-twinvq', vre: 'x-world/x-vream', vrml: 'x-world/x-vrml', vrt: 'x-world/x-vrt', vrw: 'x-world/x-vream', vts: 'workbook/formulaone', wav: 'audio/x-wav', wax: 'audio/x-ms-wax', wbmp: 'image/vnd.wap.wbmp', wcm: 'application/vnd.ms-works', wdb: 'application/vnd.ms-works', web: 'application/vnd.xara', wi: 'image/wavelet', wis: 'application/x-InstallShield', wks: 'application/vnd.ms-works', wm: 'video/x-ms-wm', wma: 'audio/x-ms-wma', wmd: 'application/x-ms-wmd', wmf: 'application/x-msmetafile', wml: 'text/vnd.wap.wml', wmlc: 'application/vnd.wap.wmlc', wmls: 'text/vnd.wap.wmlscript', wmlsc: 'application/vnd.wap.wmlscriptc', wmlscript: 'text/vnd.wap.wmlscript', wmv: 'audio/x-ms-wmv', wmx: 'video/x-ms-wmx', wmz: 'application/x-ms-wmz', wpng: 'image/x-up-wpng', wps: 'application/vnd.ms-works', wpt: 'x-lml/x-gps', wri: 'application/x-mswrite', wrl: 'x-world/x-vrml', wrz: 'x-world/x-vrml', ws: 'text/vnd.wap.wmlscript', wsc: 'application/vnd.wap.wmlscriptc', wv: 'video/wavelet', wvx: 'video/x-ms-wvx', wxl: 'application/x-wxl', 'x-gzip': 'application/x-gzip', xaf: 'x-world/x-vrml', xar: 'application/vnd.xara', xbm: 'image/x-xbitmap', xdm: 'application/x-xdma', xdma: 'application/x-xdma', xdw: 'application/vnd.fujixerox.docuworks', xht: 'application/xhtml+xml', xhtm: 'application/xhtml+xml', xhtml: 'application/xhtml+xml', xla: 'application/vnd.ms-excel', xlc: 'application/vnd.ms-excel', xll: 'application/x-excel', xlm: 'application/vnd.ms-excel', xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', xlt: 'application/vnd.ms-excel', xlw: 'application/vnd.ms-excel', xm: 'audio/x-mod', xml: 'text/plain', xmz: 'audio/x-mod', xof: 'x-world/x-vrml', xpi: 'application/x-xpinstall', xpm: 'image/x-xpixmap', xsit: 'text/xml', xsl: 'text/xml', xul: 'text/xul', xwd: 'image/x-xwindowdump', xyz: 'chemical/x-pdb', yz1: 'application/x-yz1', z: 'application/x-compress', zac: 'application/x-zaurus-zac', zip: 'application/zip', json: 'application/json'};
			extension = extension ? extension.split(',') : [];
			for (i = 0, length = extension.length; i < length; i++) {
				iu.tool.own(mime, extension[i]) && accept.push(mime[extension[i]]);
			}
			if (accept.length) {
				return accept.join(',');
			}
		};
	},
	_createButtonSwf : function() {
		var self = this,
			options = self.options,
			element = self.element,
			clone = element.clone(),
			settings,
			swf,
			id;

		self._clone = clone;

		if (element.attr('id')) {
			id = element.attr('id');
			clone.removeAttr('id').attr('data-id', id);
		} else {
			id = 'iu_uploader' + (new Date).getTime();
			element.attr('id', id);
		}
		clone.css('position', 'absolute');
		element.before(clone);

		settings = {
			flash_url: options.swf,
			upload_url: options.url,
			// file_size_limit : options.maxSize,
			file_upload_limit: 100,
			file_queue_limit: 100,
			file_types: '*.*',
			button_placeholder_id: id,
			button_text: '<a class="iu_uploader_swf_button"></a>',
			button_text_style: '.iu_uploader_swf_button{}',
			button_width: element.outerWidth(),
			button_height: element.outerHeight(),
			button_cursor: 'cursor',
			button_window_mode: 'transparent',
			// swfupload_loaded_handler: noop,
			file_post_name: 'iu_uploader_file',
			// file_dialog_start_handler: noop,
			// file_queued_handler: noop, // function(file) () {},
			file_queue_error_handler: function(file, errno, message) {
				var name = file.name, id = getFileId(name);
				if (-110 == errno) {
					self.__error(id, name, 'maxSize');
				} else if (-130 == errno) {
					self.__error(id, name, 'extensionError');
				}
			},
			file_dialog_complete_handler: function(numFilesSelected, numFilesQueued) {
				if (numFilesSelected && options.autoUpload) {
					swf.startUpload();
				}
			},
			upload_start_handler: function(file) {
				var name = file.name, id = getFileId(name);
				if (false === self.__validate(id, name)) {
					self.__error(id, name, 'validateError');
					return false;
				}
				return self.__submit(id, name);
			},
			upload_success_handler: function(file, response) {
				if (file) {
					var name = file.name, id = getFileId(name);
					self.__complete(id, name, response);
					if (swf.getStats().files_queued) {
						swf.startUpload();
					}
				}
			},
			// upload_progress_handler: noop, // function(file, loaded, total) {},
			upload_error_handler: function(file, errno, message) {
				if (file) {
					var name = file.name, id = getFileId(name);
					self.__error(id, name, 'serverError', 500);
				}
			},
			// upload_complete_handler: noop, // function(file) {},
			// queue_complete_handler: noop, // function(numFilesUploaded) {},
			debug: false
		};

		options.maxSize > 0 ? settings.file_size_limit = options.maxSize + 'b' : 0;
		options.extension ? settings.file_types = options.extension.replace(/,/g, ';').replace(/(\w+)/g, '*.$1').replace(/^\*$/, '*.*') : 0;

		if (options.progress) {
			var precious_time = +new Date;
			settings.upload_progress_handler = function(file, loaded, total) {
				var name = file.name, id = getFileId(name);
				var time = +new Date, percent = parseInt(loaded / total * 100) / 100;
				// excute each 100 ms
				if (time - precious_time > 99 || percent == 1) {
					precious_time = time;
					self.__progress(id, name, loaded, total, percent);
				}
			};
		}

		// 有待优化
		var map_file_id = {};
		function getFileId(name) {
			if (!iu.tool.own(map_file_id, name)) {
				map_file_id[name] = self._index + '_';
				self._index++;
			}
			return map_file_id[name];
		}

		self._swf = swf = new SWFUpload(settings);
		self.uploader = $('#' + swf.movieName);
	},
	_enQueue : function() {
		var self = this, file, queue, item;

		if (self._swf) {
			return;
		}

		file = self._file;
		queue = self._queue;

		file.unbind('click,change').removeAttr('style');
		item = $('<li data-index="' + self._index + '" id="iu_uploader_item' + self._index + '" class="iu_uploader_item iu_uploader_todo"></li>');
		queue.append(item);
		item.append(file);

		self._index++;
		self._createButton();
	},
	_validateFile : function() {
		var self = this,
			options = self.options,
			max = options.maxSize,
			min = options.minSize,
			file, id, name, ext, size, error,
			i, length, item, files;

		if (self._swf) {
			return true;
		}

		file = self._file[0];

		if (self._form) {
			id = self._index + '_';
			name = file.value.substr(file.value.lastIndexOf('\\') + 1);
			if (error = getExtensionError()) {
				self.__error(id, name, error);
				return false;
			}
		} else {
			files = file._dragFiles || file.files;
			for (i = 0, length = files.length; i < length; i++) {
				item = files[i];
				name = item.name;
				id = self._index + '_' + i;
				if (error = getFileError()) {
					self.__error(id, name, error);
					return false;
				}
			}
		}

		function getExtensionError() {
			if (self._extension) {
				ext = name.match(/\w+$/);
				ext = ext ? ext[0].toLowerCase() : '';
				if (!iu.tool.own(self._extension, ext)) {
					return 'extensionError';
				}
			}
		}

		function getFileError() {
			if (error = getExtensionError()) {
				return error;
			}

			if (max > 0 || min > 0) {
				size = item.size;
				if (size == 0) {
					return 'emptyError';
				}
				if (min > size) {
					return 'minSizeError';
				}
				if (max < size) {
					return 'maxSizeError';
				}
			}

			if (false === self.__validate(id, name)) {
				return 'validateError';
			}
		}

		return true;
	},
	events: {
		click: function(e) {
			if (false === this.__click(e)) {
				return false;
			}
			if (this._file[0]._dragFiles) {
				delete this._file[0]._dragFiles;
			}
		},
		change: function(e) {
			var self = this;

			if (false === self.__change(e)) {
				self.clearFile();
				return;
			}

			if (true === self._validateFile()) {
				self._enQueue();

				if (self.options.autoUpload) {
					self.upload();
				}
			} else {
				self.clearFile();
			}
		}
	},
	options: {
		url: '',
		maxSize: 0,
		minSize: 0,
		extension: '*',
		multiple: false,
		autoUpload: false,
		async: true,
		swf: null, // iu.uploader.swf url
		title: null, // button title

		click: null, // function(event) {}, // before file dialog opened, return false => prevent file dialog shown
		change: null, // function(event) {}, // after file dialog close
		validate: null, // function(id, name) {}, // return false => validateError
		submit: null, // function(id, name) {}, // before file submit, return false => prevent file submit
		progress: null, // function(id, name, loaded, total, percent) {},
		cancel : null, // function(id, name) {}, // submit cancelled
		success: null, // function(id, name, data) {},
		error: null, // function(id, name, type, errno) {}, // type may be 'extensionError|emptyError|minSizeError|maxSizeError|validateError|serverError'
		complete: function(id, name, response) {
			// response examle => {"errno":0,"msg":"","data":"image url"}
			try {
				// filter comments
				if (/\*\/$|-->$/.test(response)) {
					response = response
								.replace(/\n|\r/g, '##\\n##')
								.replace(/\/\*.*?\*\/$|<!--.*?-->$/, '')
								.replace(/##\\n##/g, '\n')
								.replace(/^\s+/, '')
								.replace(/\s+$/, '');
				}
				response = $.parseJSON(response) || '';
				if (response.data) {
					this.__success(id, name, response.data);
				} else {
					this.__error(id, name, response.msg || 'serverError', response.errno || 500);
				}
			} catch (e) {}
		},
		dragenter : null, // function() {},
		dragleave : null, // function() {},
		drop : null, // function() {},
		dropSelector : null // drop target selector, default element
	}
});

// Windows Safari 不支持拖拽上传
window.IU_UPLOADER_DRAG = {
	init : function(widget) {
		var self = iu.uploader.drag;
		if (widget) {
			document.ondragenter = self.enter;
			document.ondragover = self.over;
			document.ondragleave = self.leave;
			document.ondrop = self.drop;
			self.list.push(widget);
		}
	},
	enter : function(e) {
		var self = iu.uploader.drag;
		document.ondragenter = null;
		e.preventDefault();
		self.trigger(e, 'dragenter');
		if (window.msIndexedDB) {
			$(document).bind('mouseover', self.releaseCheck);
		}
	},
	over : function(e) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	},
	leave : function(e) {
		if (iu.uploader.drag.isLeaveDocument(e)) {
			iu.uploader.drag.release(e, 'dragleave');
		}
	},
	drop : function(e) {
		e.preventDefault();
		iu.uploader.drag.release(e, 'drop');
	},
	release : function(e, etag) { // 释放文件: 拖拽离开网页, 鼠标离开网页, 拖拽放下文件
		var self = iu.uploader.drag;
		document.ondragenter = self.enter;
		if (window.msIndexedDB) {
			$(document).unbind('mouseover', self.releaseCheck);
		}
		self.trigger(e, etag || 'mouseleave');
	},
	releaseCheck : function(e) { // IE 拖拽修正: IE 对话框不在最顶层时鼠标离开网页 elementFromPoint 方法没有返回正确的值
		if (!e.dataTransfer) {
			iu.uploader.drag.release(e, 'dragleave');
		}
	},
	isLeaveDocument : window.mozIndexedDB ? function(e) {
		return !e.relatedTarget || !document.elementFromPoint(e.clientX, e.clientY);
	} : (window.msIndexedDB ? function(e) {
		return (e.x === 0 && e.y === 0) || !document.elementFromPoint(e.clientX, e.clientY);
	} : (/Apple/.test(navigator.vendor) ? function(e) {
		return e.x < 0 || e.y < 0;
	} : function(e) {
		return e.x === 0 && e.y === 0;
	})),
	dropTarget : window.msIndexedDB ? function(e) {
		return document.elementFromPoint(e.clientX, e.clientY) || e.target;
	} : function(e) {
		return e.toElement || e.target;
	},
	list : [],
	trigger : function(e, etag) {
		var widget, i, list = iu.uploader.drag.list, length = list.length, options, target, container;

		if (etag == 'drop') {
			target = iu.uploader.drag.dropTarget(e);
			for (i = 0; i < length; i++) {
				widget = list[i];
				if (options = widget.options) {
					if (options[etag]) {
						options[etag].call(widget, e);
					}
					container = options.dropSelector ? $(options.dropSelector) : widget.element;
					if (container[0] == target || container.find(target).length) {
						widget._drop(e);
						break;
					}
				} else {
					list = list.splice(i, 1);
					i--;
				}
			}
		} else {
			for (i = 0; i < length; i++) {
				widget = list[i];
				if (options = widget.options) {
					if (options[etag]) {
						options[etag].call(widget, e);
					}
				} else {
					list = list.splice(i, 1);
					i--;
				}
			}
		}

		if (list.length == 0) {
			document.ondragenter = null;
			document.ondragover = null;
			document.ondragleave = null;
			document.ondrop = null;
		}
	}
};