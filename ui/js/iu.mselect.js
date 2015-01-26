/**
 * iu.mselect.js
 * */
iu.widget('mselect', {
	
	//初始化函数
	init : function() {
		var self = this,
			options = self.options,
			ele = self.element;
		
		if(options.contents.length > 0 && ele[0].getAttribute('multiple')!='multiple')	{
			options.type == undefined ? options.type = 'single_in' : 0;
		}else {
			options.type = 'dom';
		}
		
		switch(options.type)	{
			case 'single_in': {
				//创建在dom内部的单选下拉菜单
				self._createSingleSelect(0);
				break;
			}
			case 'multiple_in': {
				//创建在dom内部的多选下拉菜单
				self._createMultipleSelect(0);
				break;
			}
			case 'single_out': {
				//创建在dom兄弟节点的单选下拉菜单
				self._createSingleSelect(1);
				break;
			}
			case 'multiple_out': {
				//创建在dom兄弟节点的多选下拉菜单
				self._createMultipleSelect(1);
				break;
			}
			case 'dom': {
				//根据给定的select元素，提取内容创建兄弟节点的下拉菜单
				self._createSelectByDom();
				break;
			}
		}
		
	},
	
	destroy : function() {
		var self = this;	
		$(document).unbind('mousedown', self.events.mousedown);
		$(document).unbind('keydown', self.events.keydown);
	},
	
	//设置样式
	_setStyle : function(btnwidth, sltwidth, distance, zindex) {
		var self = this,
			options = self.options,
			ele = self.element;
		
		distance = parseInt(distance)? distance : 0;
		if(!btnwidth && !sltwidth)	{
			btnwidth = sltwidth = 200;
		}else if(btnwidth && !sltwidth) {
			sltwidth = btnwidth;	
		}
		
		if(options.mobile == 0)	{
			
			if(options.type == 'single_out' || options.type == 'multiple_out' || options.type == 'dom')
				ele = ele.next();
			
			var ms_btn = ele.children().eq(0),
				ms_slt = ele.children().eq(1);
			
			ele.css({'margin-top': options.margintop, 'margin-left': options.marginleft});
			
			ms_btn.css('width', btnwidth - parseInt(ms_btn.css('padding-left')) - 
							parseInt(ms_btn.css('border-left-width')) - parseInt(ms_btn.css('padding-right')) 
							- parseInt(ms_btn.css('border-right-width')));
			ms_btn.children().eq(0).css('width', btnwidth - parseInt(ms_btn.css('padding-left')) - 
							parseInt(ms_btn.css('border-left-width')) - parseInt(ms_btn.css('padding-right')) 
							- parseInt(ms_btn.css('border-right-width')) - 20);
			ms_slt.css('width', sltwidth - parseInt(ms_slt.css('padding-left')) - 
									parseInt(ms_slt.css('border-left-width')) - parseInt(ms_slt.css('padding-right')) 
									- parseInt(ms_slt.css('border-right-width')));	
			ms_slt.css('left', distance + 'px');
			ms_slt.css('z-index', zindex);
			
		}else if(options.mobile == 1)	{
			
			if(options.type == 'single_out' || options.type == 'multiple_out' || options.type == 'dom')
				ele = ele.prev();
			
			var ms_slt = ele;
			
			ms_slt.css('width', sltwidth - parseInt(ms_slt.css('padding-left')) - 
									parseInt(ms_slt.css('border-left-width')) - parseInt(ms_slt.css('padding-right')) 
									- parseInt(ms_slt.css('border-right-width')));

			ms_slt.css({'margin-top': options.margintop, 'margin-left': options.marginleft});
		}
		
	},
	
	
	//创建下拉框内容
	_createContent : function(type)	{
		var self = this,
			options = self.options,
			ele = self.element;
		
		if(options.mobile == 0)	{
			if(type == 0)	{
				var ms_frame = $('<div class="iu_mselect_button">'
											+ '<span class="iu_mselect_text"></span><span class="iu_mselect_triangle_down"></span>'
										+ '</div>'
										+'<div class="iu_mselect_select"></div>'),
				ms_btn = ms_frame.eq(0),
				ms_slt = ms_frame.eq(1),
				ms_option = $('<div class="iu_mselect_option"></div>');
			}else if(type == 1) {
				var ms_frame = $('<div class="iu_mselect_frame">'
											+'<div class="iu_mselect_button">' 
												+'<span class="iu_mselect_text"></span><span class="iu_mselect_triangle_down"></span>'
											+'</div>'
											+'<div class="iu_mselect_select"></div>'
										+'</div>'),
				ms_btn = ms_frame.children().eq(0),
				ms_slt = ms_frame.children().eq(1),
				ms_option = $('<div class="iu_mselect_option"></div>');
			}	
		}else if(options.mobile == 1)	{
			if(self.options.type == 'single_out' || self.options.type == 'single_in')	{
				var ms_frame = $('<select class="iu_mselect_system_select"></select>'),
					ms_slt = ms_frame,
					ms_option = $('<option class="iu_mselect_option"></option>');	
			}else if(self.options.type == 'multiple_out' || self.options.type == 'multiple_in')	{
				var ms_frame = $('<select class="iu_mselect_system_select" multiple="multiple"></select>');
					ms_slt = ms_frame,
					ms_option = $('<option class="iu_mselect_option"></option>');
			}
			
		}
		
		if(ele.css('position') != 'absolute'){
			ele.css('position', 'relative');
		}
		
		for(var i=0; i<options.contents.length; i++) {
			if(typeof(options.contents[i]) == 'object')	{
				ms_option.clone().attr('value', options.contents[i][0]).html(options.contents[i][1]).appendTo(ms_slt);
			}else {
				ms_option.clone().attr('value', options.contents[i]).html(options.contents[i]).appendTo(ms_slt);
			}
		}
		
		options.btnwidth = options.btnwidth? options.btnwidth : 200;
		options.sltwidth = options.sltwidth? options.sltwidth : 200;
		options.left = options.left? options.left : 0;
		
		if(options.mobile == 1)	{
			type == 0 ? ele.html(ms_frame) : ele.before(ms_frame); 			//创建dom				
		}else {
			type == 0 ? ele.html(ms_frame) : ele.after(ms_frame); 			//创建dom		
		}
		type == 0 ? 0 : ele = ele.next();
		
		if(!options.singleHeight) {
			var first_child = ms_slt.children().eq(0);
			ele.addClass('iu_mselect_selected');
			options.singleHeight = first_child.outerHeight();
			ele.removeClass('iu_mselect_selected');
		} else {
			var first_child = ms_slt.children().eq(0),
				child_height = options.singleHeight - parseInt(first_child.css('padding-top')) - parseInt(first_child.css('padding-bottom')) 
								- parseInt(first_child.css('border-top-width')) - parseInt(first_child.css('border-bottom-width'));
			ms_slt.children().css({'height' : child_height, 'line-height' : child_height + 'px'});
		}
	},

	
	_getValueByKey : function(key) {
		var self = this,
			options = self.options;
		for(var i=0; i < options.contents.length; i++)	{
			if(options.contents[i][0] == key)
				return options.contents[i][1];
		}		
	},
	
	_getLocationByKey : function(key) {
		var self = this,
			options = self.options;
		for(var i=0; i < options.contents.length; i++)	{
			if(options.contents[i][0] == key)
				return i;
		}		
	},
	
	_makeData : function(keys, value) {
		var ar_value = [], ar_object = [];
		ar_value = value.split(';');
		
		for(var i=0; i< keys.length; i++)	{
			ar_object[i] = [];
			ar_object[i][0] = keys[i];
			ar_object[i][1] = ar_value[i];
		}
		return ar_object;
	},
	
	//创建单选下拉框
	_createSingleSelect : function(type) {
		var self = this,
			options = self.options,
			ele = self.element;
		
		self.single = 1;
		self._createContent(type);
		
		//下拉框样式设置
		self._setStyle(options.btnwidth, options.sltwidth, options.left, options.zindex);
		
		if(options.mobile == 1)	{
			if(type == 1) 
				ele = ele.prev();
				
			var ms_slt = ele;
			
			if(options.showtext)	{
				if(!options.defaultIndex)	{
					self.ar_select = options.contents[0][0];
					ms_slt.text(options.contents[0][0]);
				}else {
					ms_slt.children().attr('selected', false).eq(self._getLocationByKey(options.defaultIndex)).attr('selected', true);	
					ms_slt.text(options.defaultIndex);
					self.ar_select = options.defaultIndex;
				}
			}else {
				if(!options.defaultIndex)	{
					self.ar_select = options.contents[0][0];
				}else {
					ms_slt.children().attr('selected', false).eq(self._getLocationByKey(options.defaultIndex)).attr('selected', true);	
					self.ar_select = options.defaultIndex;
				}
			}

			ms_slt.bind('change', function(){
				var key = ms_slt.children('option:selected').val(),
					value = ms_slt.children('option:selected').html();
				options.change([key, value]);
			});
			
		}else if(options.mobile == 0)	{
			
			if(type == 1) 
				ele = ele.next();
				
			var ms_btn = ele.children().eq(0),
				ms_slt = ele.children().eq(1);
			
			self.selectDom = ms_slt;
			
			if(options.showtext)	{
				if(!options.defaultIndex)	{
					ms_btn.children().eq(0).html(options.desc + options.contents[0][0]);	
					self.ar_select = options.contents[0][0];
				}else {
					ms_btn.children().eq(0).html(options.desc + options.defaultIndex);	
					self.ar_select = options.defaultIndex;
				}
			}else {
				if(!options.defaultIndex)	{
					ms_btn.children().eq(0).html(options.desc + options.contents[0][1]);	
					self.ar_select = options.contents[0][0];
				}else {
					ms_btn.children().eq(0).html(options.desc + self._getValueByKey(options.defaultIndex));	
					self.ar_select = options.defaultIndex;
				}	
			}
			
			//事件绑定
			ms_btn.bind('mousedown', function(e) {
				if(e.which == 3) return;
				if(!ele.hasClass('iu_mselect_selected')) {
					self.first_open = 1;
					ms_slt.scrollTop(self._getLocationByKey(self.ar_select) * options.singleHeight).children().removeClass('iu_mselect_option_hover').eq(self._getLocationByKey(self.ar_select)).addClass('iu_mselect_option_hover');
					ele.addClass('iu_mselect_selected');
					ms_btn.children().eq(1).attr('class', 'iu_mselect_triangle_up');
					$(document).bind('mousedown', self.events.mousedown);
					$(document).bind('keydown', self.events.keydown);
				} else {
					ele.removeClass('iu_mselect_selected');
					ms_btn.children().eq(1).attr('class', 'iu_mselect_triangle_down');
					if(self.options.close)	
						self.options.close([self.ar_select, ele.children().eq(0).children().eq(0).text()]);
					$(document).unbind('mousedown', self.events.mousedown);
					$(document).unbind('keydown', self.events.keydown);
				}
			});
			
			ms_slt.bind({
				'mouseup contextmenu' : function(e) {
					if(self.hideflag && (e.which == 3)) {
						self.hideflag = false;
						ele.removeClass('iu_mselect_selected');
						ms_btn.children().eq(1).attr('class', 'iu_mselect_triangle_down');
						return false;
					}
					var target = $(e.target);
					if(!target.hasClass('iu_mselect_option')) {
						target = target.parents('.iu_mselect_option');
					}
					if(!target.length) {
						return;
					}
					if(self.ar_select != options.contents[target.index()][0])		{
						self.ar_select = options.contents[target.index()][0];
						options.showtext ? ms_btn.children().eq(0).html(options.desc + target.attr('value')) : ms_btn.children().eq(0).html(options.desc + target.text());
						if(self.options.change)
							self.options.change([self.ar_select, ele.children().eq(0).children().eq(0).text()]);				//change回调事件	
						if(self.options.close)
							self.options.close([self.ar_select, ele.children().eq(0).children().eq(0).text()]);				
					}
					ms_btn.children().eq(1).attr('class', 'iu_mselect_triangle_down');
					$(document).unbind('mousedown', self.events.mousedown);
					$(document).unbind('keydown', self.events.keydown);
					self.hideflag = true;
					if(e.which == 1) {
						self.hideflag = false;
						ele.removeClass('iu_mselect_selected');
					}
				}
			});

			ms_slt.bind('mouseover', self.events.mouseover);
		}
		
	},
	
	//创建多选下拉框
	_createMultipleSelect : function(type) {
		var self = this,
			options = self.options,
			ele = self.element;
			
		self.single = 0;
		self._createContent(type);
		self._setStyle(options.btnwidth, options.sltwidth, options.left);
		
		if(options.mobile == 0)	{
			if(type == 1) 
				ele = ele.next();
				
			var ms_btn = ele.children().eq(0),
				ms_slt = ele.children().eq(1);
			
			self.ar_select = [];
			
			if(options.showtext)	{
				if(typeof(options.defaultIndex[0]) == 'undefined')	{
					ms_btn.children().eq(0).html(options.nonetext);
				}else {
					for(var i=0; i<options.defaultIndex.length-1; i++)	{
						ms_btn.children().eq(0).append(options.defaultIndex[i] + ';');	
					}
					ms_btn.children().eq(0).append(options.defaultIndex[options.defaultIndex.length-1]);
					self.ar_select = options.defaultIndex;
				}	
			}else {
				if(typeof(options.defaultIndex[0]) == 'undefined')	{
					ms_btn.children().eq(0).html(options.nonetext);
				}else {
					for(var i=0; i<options.defaultIndex.length-1; i++)	{
						ms_btn.children().eq(0).append(self._getValueByKey(options.defaultIndex[i]) + ';');	
					}
					ms_btn.children().eq(0).append(self._getValueByKey(options.defaultIndex[options.defaultIndex.length-1]));
					self.ar_select = options.defaultIndex;
				}		
			}
			self.selectDom = ele.children().eq(1);
			
			//事件绑定
			ms_btn.bind('mousedown', function(e) {
				if(e.which == 3) return;
				if(!ele.hasClass('iu_mselect_selected')) {
					self.first_open = 1;
					ms_slt.scrollTop(self._getLocationByKey(self.ar_select[0]) * options.singleHeight).children().removeClass('iu_mselect_option_selected');
					for(var i=0; i<self.ar_select.length; i++)	{
						ms_slt.children().eq(self._getLocationByKey(self.ar_select[i])).addClass('iu_mselect_option_selected');
					}
					ele.addClass('iu_mselect_selected');
					ms_btn.children().eq(1).attr('class', 'iu_mselect_triangle_up');
					$(document).bind('mousedown', self.events.mousedown);
					$(document).bind('keydown', self.events.keydown);
				} else {
					ele.removeClass('iu_mselect_selected');
					ms_btn.children().eq(1).attr('class', 'iu_mselect_triangle_down');
					if(self.options.close)	
						self.options.close([self.ar_select, self._makeData(self.ar_select, ele.children().eq(0).children().eq(0).text())]);
					$(document).unbind('mousedown', self.events.mousedown);
					$(document).unbind('keydown', self.events.keydown);
				}
			});
			
			ms_slt.bind({
				'mouseup contextmenu' : function(e) {
					if(self.hideflag && (e.which == 3)) {
						self.hideflag = false;
						ms_btn.children().eq(1).attr('class', 'iu_mselect_triangle_down');
						return false;
					}
					var target = $(e.target);
					if(!target.hasClass('iu_mselect_option')) {
						target = target.parents('.iu_mselect_option');
					}
					if(!target.length) {
						return;
					}
					if(target.hasClass('iu_mselect_option_selected'))	{
						target.removeClass('iu_mselect_option_selected');	
						for(var i=0; i<self.ar_select.length; i++)	{
							if(self.ar_select[i] == options.contents[target.index()][0])	{
								for(var j = i; j<self.ar_select.length-1; j++)	{
									self.ar_select[j] = self.ar_select[j+1];
								}
								self.ar_select.pop();
								break;
							}
						}
					}else {
						target.addClass('iu_mselect_option_selected');	
						self.ar_select.push(options.contents[target.index()][0]);
					}
					var text = '';
					if(self.ar_select.length == 0)	{
						text = options.nonetext;
					}else if(self.ar_select.length <= 4)	{
						if(options.showtext)	{
							for(var i=0; i<self.ar_select.length - 1; i++)	{
								text = text + ms_slt.children().eq(self._getLocationByKey(self.ar_select[i])).attr('value') + ';';
							}
							if(self.ar_select.length != 0)	{
								text = text + ms_slt.children().eq(self._getLocationByKey(self.ar_select[self.ar_select.length - 1])).attr('value');
							}
						}else {
							for(var i=0; i<self.ar_select.length - 1; i++)	{
								text = text + ms_slt.children().eq(self._getLocationByKey(self.ar_select[i])).html() + ';';
							}
							if(self.ar_select.length != 0)	{
								text = text + ms_slt.children().eq(self._getLocationByKey(self.ar_select[self.ar_select.length - 1])).html();
							}
						}
					}else {
						text = options.moretext.replace('%s', self.ar_select.length); 
					}
					ms_btn.children().eq(0).html(options.desc + text);
					if(self.options.change)	
						self.options.change([self.ar_select, self._makeData(self.ar_select, ele.children().eq(0).children().eq(0).text())]);						//change回调事件
					self.hideflag = true;
					if(e.which == 1) {
						self.hideflag = false;
					}
				}

			});
				
			ms_slt.bind('mouseover', self.events.mouseover);
			
		}else if(options.mobile == 1)	{
			if(type == 1) 
				ele = ele.prev();
				
			var ms_slt = ele;
			
			self.ar_select = [];
			
			if(options.showtext)	{
				if(typeof(options.defaultIndex[0]) == 'undefined')	{
					self.ar_select = ['' + options.contents[0][0]];
					ms_slt.text(options.contents[0][0]);
				}else {
					var text = '';
					for(var i=0; i<options.defaultIndex.length-1; i++)	{
						ms_slt.children().attr('selected', false).eq(self._getLocationByKey(options.defaultIndex[i])).attr('selected', true);
						text = text + options.defaultIndex[i];
					}
					self.ar_select = options.defaultIndex;
					ms_slt.text(text);
				}
			}else {
				if(typeof(options.defaultIndex[0]) == 'undefined')	{
					self.ar_select = [''+options.contents[0][0]];
				}else {
					for(var i=0; i<options.defaultIndex.length-1; i++)	{
						ms_slt.children().attr('selected', false).eq(self._getLocationByKey(options.defaultIndex[i])).attr('selected', true);
					}
					self.ar_select = options.defaultIndex;
				}
			}

			ms_slt.bind('change', function(){
				var options = ms_slt.children(),
					data = [];
				data[0] = [], data[1] = [];
				
				for(var i=0; i<options.length; i++)	{
					if(options.eq(i).attr('selected'))	{
						data[0].push(options.eq(i).attr('value'));
						data[1].push([options.eq(i).attr('value'), options.eq(i).html()]);
					}
				}
				
				self.options.change(data);
			});
		}
				
	},
	
	//根据dom元素，提取内容创建下拉菜单
	_createSelectByDom : function() {
		var self = this,
			ele = self.element,
			options = self.options;
		
		var flag = ele.attr('multiple');
		if(flag) options.defaultIndex = [];
		
		options.contents = [];
		for(var i=0; i < ele.children().length; i++)	{
			options.contents[i] = [];
			options.contents[i][0] = ele.children().eq(i).attr('value');
			if(!options.contents[i][0])
				options.contents[i][0] = ele.children().eq(i).text();
			options.contents[i][1] = ele.children().eq(i).text();
			
			if(ele.children().eq(i).attr('selected'))	{
				if(flag) {
					options.defaultIndex.push(options.contents[i][0]);
				}else {
					options.defaultIndex = options.contents[i][0];
				}
			}
		}
		
		ele.hide();
		
		if(flag)	{
			self._createMultipleSelect(1);
		}else {
			self._createSingleSelect(1);
		}
	},
	
	setOption : function(key, value) {
		var self = this;
		switch(key) {
			case 'setStyle': {
				self._setStyle(value.btnwidth, value.sltwidth, value.left);
				break;
			}
		}
	},
	
	events : {
		mousedown : function(e){
			var self = this,
				ele = self.element,
				options = self.options;
			
			if(options.type == 'single_out' || options.type == 'multiple_out' || options.type == 'dom')
				ele = ele.next();
			
			var flag = 0;
				
			if(!ele.hasClass('iu_mselect_selected'))	{
				ele.children().eq(0).children().eq(1).attr('class', 'iu_mselect_triangle_down');
				$(document).unbind('mousedown', self.events.mousedown);
				$(document).unbind('keydown', self.events.keydown);
			}else {
				if(self.selectDom)	{
					target = $(e.target);
					target.add(target.parents()).each(function(i, tag) {
						if (tag == self.selectDom[0]) {
							flag = 1;
						}
					});
					
					if(self.first_open == 1) {
						self.first_open = 0;
					}else {
						if(!flag)	{
							if(self.single)	{
								ele.removeClass('iu_mselect_selected');
								ele.children().eq(0).children().eq(1).attr('class', 'iu_mselect_triangle_down');
								$(document).unbind('mousedown', self.events.mousedown);
								$(document).unbind('keydown', self.events.keydown);
							}else {
								if(self.options.close)	
									self.options.close([self.ar_select, self._makeData(self.ar_select, ele.children().eq(0).children().eq(0).text())]);
								ele.removeClass('iu_mselect_selected');
								ele.children().eq(0).children().eq(1).attr('class', 'iu_mselect_triangle_down');
								$(document).unbind('mousedown', self.events.mousedown);
								$(document).unbind('keydown', self.events.keydown);
							}
						}
					}
				}
			}
		},

		keydown : function(e) {
			var self = this,
				ele = self.element,
				options = self.options;

			if(options.type == 'single_out' || options.type == 'multiple_out' || options.type == 'dom')
				ele = ele.next();

			var m_options = ele.children().eq(1).children(),
				m_option = m_options.eq(0);

			var m_height = m_option.height() + parseInt(m_option.css('padding-top')) + parseInt(m_option.css('padding-bottom'))
						   + (parseInt(m_option.css('margin-top')) + parseInt(m_option.css('margin-bottom')))/2
						   + parseInt(m_option.css('border-top')) + parseInt(m_option.css('border-bottom'));

			if( e.which >= 65 && e.which <= 90 ) {
				if(typeof(self.ar_select) == 'string') {
					m_options.removeClass('iu_mselect_option_hover');	
				}	
				m_options.eq(self.search_slt).removeClass('iu_mselect_option_hover');
				var ii = 0;
				if(self.keydown == e.which)	{
					ii = self.search_slt + 1;
				}
				for(var i=ii; i<options.contents.length; i++)	{
					var str = options.contents[i][1].substring(0,1) + '';
					var keys = self.keyList[e.which].split(',');
					if(keys[0] == str || keys[1] == str) {
						ele.children().eq(1).scrollTop(m_height * i);
						m_options.eq(i).addClass('iu_mselect_option_hover');
						self.search_slt = i;
						self.keydown = e.which;
						break;
					}
				}

				if(self.search_slt && self.search_slt < ii) {
					for(var i=0; i<options.contents.length; i++)	{
						var str = options.contents[i][1].substring(0,1) + '';
						var keys = self.keyList[e.which].split(',');
						if(keys[0] == str || keys[1] == str) {
							ele.children().eq(1).scrollTop(m_height * i);
							m_options.eq(i).addClass('iu_mselect_option_hover');
							self.search_slt = i;
							self.keydown = e.which;
							break;
						}
					}
				}
			}

			if(e.which == 38) {
				m_options.eq(self.search_slt).removeClass('iu_mselect_option_hover');
				if(self.search_slt > 0) self.search_slt--;
				m_options.eq(self.search_slt).addClass('iu_mselect_option_hover');
				ele.children().eq(1).scrollTop(m_height * self.search_slt);
				return false;
			}

			if(e.which == 40) {
				m_options.eq(self.search_slt).removeClass('iu_mselect_option_hover');
				if(self.search_slt < options.contents.length - 1) self.search_slt++;
				m_options.eq(self.search_slt).addClass('iu_mselect_option_hover');
				ele.children().eq(1).scrollTop(m_height * self.search_slt);
				return false;
			}

			ele.children().eq(1).unbind('mouseover');

			setTimeout(function(){
				ele.children().eq(1).bind('mouseover', self.events.mouseover);
			}, 200);
		},

		mouseover : function(e) {
			var target = $(e.target);
			if(!target.hasClass('iu_mselect_option')) {
				target = target.parents('.iu_mselect_option');
			}
			if(!target.length) {
				return;
			}
			target.addClass('iu_mselect_option_hover').siblings().removeClass('iu_mselect_option_hover');
		}

	},
	
	keyList : {
		'65' : 'a,A',
		'66' : 'b,B',
		'67' : 'c,C',
		'68' : 'd,D',
		'69' : 'e,E',
		'70' : 'f,F',
		'71' : 'g,G',
		'72' : 'h,H',
		'73' : 'i,I',
		'74' : 'j,J',
		'75' : 'k,K',
		'76' : 'l,L',
		'77' : 'm,M',
		'78' : 'n,N',
		'79' : 'o,O',
		'80' : 'p,P',
		'81' : 'q,Q',
		'82' : 'r,R',
		'83' : 's,S',
		'84' : 't,T',
		'85' : 'u,U',
		'86' : 'v,V',
		'87' : 'w,W',
		'88' : 'x,X',
		'89' : 'y,Y',
		'90' : 'z,Z'
	},

	options : {
		contents : [],
		btnwidth : null,
		sltwidth : null,
		singleHeight : null,
		defaultIndex : null,
		left : 0,
		type : null,
		change : null,
		close : null,
		mobile : 0,					// 1 表示移动环境
		zindex : 20,
		showtext : 0,				// 1 表示显示value值
		nonetext : 'please select...',
		moretext : '%s items selected',
		marginleft : 0,
		margintop : 0,
		desc : ''
 	}
	
});