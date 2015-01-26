/**
 * Depends:
 * jQuery, isapp
 * */

(function() {
var ui = function (){/*is ui framework*/}, app = isapp, $ = jQuery;

// core start
ui.z_index = 10000;
ui.top = null;

ui.toast_visible = true;
/**
 * show a dialog
 * 
 * @param {data} dialog data
 * 
 * always show in the center
 * 
 * 1	data = 'dialog content' // the simplest call
 * 2	data = {
 * 			content : '',
 * 			title : '',
 * 			id : '',
 * 			duration : 200, // show in duration
 * 			border : true, // false
 * 			radius : 4, // 4px
 * 			btns : {
 * 				'btn_text:btn_class' : click_call
 * 			},
 * 			//mask : true, // dialog mask
 * 			hide_outside : false, // hide the dialog when you click the outside or the dialog, default true
 * 			once : false, // indicate this dialog will show only once, default false
 * 			visible : true, // 
 * 			close_fn : fn, // fn called when the dialog closed,
 * 			close : true, // close button is visible default
 * 			middle : true // vertical-align middle,
 *			top : 0,
 * 			left : 0
 * 		}
 * */
var Dialog = function(data) {
	var me = this, id, create, btn, btns, btn_sum, btn_class, html;
	
	this.show = function() {
		var html, img, loaded;
		if (!me.dom) {
			return;
		}
		
		ui.top = me;
		me.dom.css('z-index', ui.z_index++);
		
		if (!me.showing()) {
/*			
			html = me.content.html();

			if (/iframe/.test(html)) {
				me.dom.css('display', 'block').css('visibility', 'hidden');
				setTimeout(function() {
					me.dom.css('display', 'none').css('visibility', 'visible');
					me.dom.fadeIn(me.duration);
					me.adjust();
				}, 200);
			} else if (/img/.test(html)) {
				//*/
				/*
				me.dom.css('display', 'block').css('visibility', 'hidden');
				setTimeout(function() {
					me.dom.css('display', 'none').css('visibility', 'visible');
					me.dom.fadeIn(me.duration);
					me.adjust();
				}, 200);
				//*/
/*
				img = me.dom.find('img')[0];
				if (img && !img.loaded) {
					$(img).bind('load', function() {
						loaded = true;
						me.dom.css('display', 'none').css('visibility', 'visible');
						me.dom.fadeIn(me.duration);
						me.adjust();

						$(img).unbind('load');
						img.loaded = 1;
					});
				}

				setTimeout(function() {
					if (loaded) {
						return;
					}

					me.dom.css('display', 'none').css('visibility', 'visible');
					me.dom.fadeIn(me.duration);
					me.adjust();
				}, 200);

			} else {//*/
				me.dom.fadeIn(me.duration);
				me.adjust();
/*			
			}
//*/
		}
	};
	
	this.showing = function() {return 'block' == me.dom.css('display');};
	
	this.hide = function() {
		if (me.dom && me.showing()) {
			me.dom.hide();
			me.dom[0].once && me.remove();
			return;
			me.dom.fadeOut(200, function() {
				me.dom[0].once && me.remove();
			});
		}
	};
	
	this.remove = function() {
		delete Dialog.list[me.id];
		me.dom.remove();
		$(window).unbind('resize', me.resizeListener);
		for (var k in me) {
			delete me[k];
		}
	};
	
	// hide title when title=''
	this.update = function(data) {
		var content = data.content, title = data.title, border = data.border !== false, shadow, radius = null == data.radius ? 8 : parseInt(data.radius) || 0, background = false !== data.background, visible = data.visible;
		
		if (me.dom) {
			app.isNU(content) ? '' : me.content[0].innerHTML = content;
			
			if (app.isNU(title)) {
			} else if ('' === title) {
				me.title[0].style.display = 'none';
			} else {
				me.title[0].innerHTML = title;
				me.title[0].style.display = 'block';
			}
			shadow = border ? 'black 1px 1px 6px' : '0';
			
			border = border ? '6px solid #FFF' : 'none';
			radius = radius + 'px';
			background = background ? 'white' : 'transparent';
			
			me.box.css('border', border).css('border-radius', radius).css('background', background).css('box-shadow', shadow);
			false == data.close ? me.close_btn.hide() : me.close_btn.show();
			null == data.mask ? 0 : data.mask ? me.mask.show() : me.mask.hide();
			
			me.showing() ? me.adjust() :  false !== visible && me.show();
		}
	};
	
	/**
	 * adjust dialog's position
	 * */
	this.adjust = function() {
		// log(me.box.outerWidth(), me.box.outerHeight());
		
		me.box.css('margin-left', - me.box.outerWidth() * 0.5);
		
		me.resize();
		!me.listened && $(window).bind('resize', me.resizeListener);
		me.listened = true;
	};
	
	this.resizeListener = function() {
		me.resize();
	};
	
	this.resize = function() {
		var me = this, w_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 1, height = me.box.outerHeight(), width = me.box.outerWidth(), rate = height / w_height, top, width;
		
		if (me.middle || rate > 0.618) {
			// top : 50%
			me.box.css('margin-top', '-' + (height * 0.5) + 'px').css('top', '50%').css('margin-left', '-' + (width * 0.5) + 'px');
		} else {
			top = w_height * 0.382 - height * 0.5;
			me.box.css('margin-top', top + 'px').css('top', 0);
		}

		var box = me.box, val;
		if (me.left) {
			val = parseFloat(me.box.css('margin-left'));
			val -= (parseFloat(box.attr('offset_left')) || 0);
			val += me.left;

			box.css('margin-left',  val).attr('offset_left', me.left);
		}

		if (me.top) {
			val = parseFloat(me.box.css('margin-top'));
			val -= (parseFloat(box.attr('offset_top')) || 0);
			val += me.top;

			box.css('margin-top',  val).attr('offset_top', me.top);
		}
	};
	
	id = data.id || 'dialog_' + app.randString(10);
	me.id = '_ui_dialog' + id;
	me.dom = $('#_ui_dialog' + id);
	me.duration = parseInt(data.duration, 10) || 200;
	Dialog.fn[me.id] ? '' : Dialog.fn[me.id] = {};
	
	if (app.isStr(data.id)) {
		create = !me.dom.length;
		if (!data.content) {
			data.content = $('#' + data.id).html() || '';
		}
	} else {
		create = true;
	}
	
	if (create) {
		html =
			'<div id="_ui_dialog' + id + '" style="position:fixed;top:0;left:0;display:none;width:100%;height:100%;">'
			+'<div class="ui_dialog_mask" id="_ui_dialog_mask' + id + '" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#000;opacity:0.5;filter:alpha(opacity=50);"></div>'
			+'<div class="ui_dialog_box" id="_ui_dialog_box' + id + '" style="position:fixed;top:50%;left:50%;border-radius:8px;">'
			// width:27px;height:27px;background:url(\'http://w11.camcard.com/images/closelabel.png\');top:-25px;right:-25px;cursor:pointer;
			+'<div class="ui_dialog_title" id="_ui_dialog_title' + id + '" style="background:#565756;color:white;padding:5px;display:none;"></div>'
			+'<div class="ui_dialog_content" id="_ui_dialog_content' + id + '"></div>'
			+'<div class="ui_dialog_btns"  id="_ui_dialog_btns' + id + '" style="background:#F0F0F0;text-align:right;display:none;padding:10px 10px 5px 10px;"></div>'
			+'<span class="dialog_close" id="_ui_dialog_hide' + id + '" style="position:absolute;display:block;"></span>'
			+'</div>'
			+'</div>';
		$(html).appendTo('body');
		
		$('#_ui_dialog_hide' + id).click(function() {
			me.close_fn && app.isFn(me.close_fn) ? me.close_fn.apply(me) : log('ui.dialog() close_fn should be a function');
			me.hide();
		});
		
		me.dom = $('#_ui_dialog' + id);
	}
	
	Dialog.list[me.id] = me;
	
	me.once = me.dom[0].once = data.once == true;
	me.mask = $('#_ui_dialog_mask' + id);
	me.box = $('#_ui_dialog_box' + id);
	me.title = $('#_ui_dialog_title' + id);
	me.content = $('#_ui_dialog_content' + id);
	me.btns = $('#_ui_dialog_btns' + id);
	me.close_btn = $('#_ui_dialog_hide' + id);
	me.close_fn = data.close_fn || Empty;
	me.middle = data.middle || false;
	me.left = data.left;
	me.top = data.top;
	
	if (data.btns) {
		btn_sum = 0;
		me.btns.html('');
		for (btn in data.btns) {
			btns = btn.split(':');
			btn_sum++;
			$(ui.button({text : btns[0], klass : btns[1]})).appendTo(me.btns).click(function(e) {
				Dialog.fn[me.id][this._ui_btn_text](e) ? '' :  me.dom && me.hide();
			})[0]._ui_btn_text = btn;
			Dialog.fn[me.id][btn] = data.btns[btn];
		}
		me.btns[0].style.display = btn_sum ? 'block' : 'none';
	}
	
	//$('#_ui_dialog_mask' + id).unbind('click');
	if (false == data.hide_outside) {
		me.mask.unbind('click');
		me.hide_outside = false;
	} else {
		me.hide_outside = !me.mask[0]._ui_hide_outside;
		if (me.hide_outside) {
			me.mask[0]._ui_hide_outside = true;
			me.mask.click(function() {
				me.close_fn && app.isFn(me.close_fn) ? me.close_fn.apply(me) : log('ui.dialog() close_fn should be a function');
				me.hide();
			});
		}
	}
	
	this.update(data);
};
Dialog.fn = {};
Dialog.list = {};

var dialogEsc = function(e) {
	var d = ui.top, k, z_index, z_index_cur;
	if (27 == e.keyCode && d) {
		if (d.hide_outside && ui.isBlocked(d.dom)) {
			ui.top = null;
			
			if (!d.hide) {
				return;
			}
			
			d.hide();
			d.close_fn && app.isFn(d.close_fn) ? d.close_fn.apply(d) : log('ui.dialog() close_fn should be a function');
			
			z_index_cur = 0;
			for (k in Dialog.list) {					
				d = Dialog.list[k];
				z_index = d.dom.css('z-index');
				if (ui.isBlocked(d.dom) && z_index > z_index_cur) {
					z_index_cur = z_index;
					ui.top = d;
				}
			}
		}
	}
};
$(document).keyup(dialogEsc);

var popup_list = [];

var Tab = function(data) {
	var tab = data.tab, tabed = data.tabed, etag, tab_class, tabed_class, T = Tab, me = this;
	
	if ('string' != app.type(tab) || 'string' != app.type(tabed)) {
		log('ui.tab(data) data.tab and data.tabed are both required and should be string', 1);
		return;
	}
	
	if (!T.selector[tab]) {
		T.selector[tab] = 1;
	} else {
		log('ui.tab() tab selector(' + tab +') bind tab event again');
	}
	
	this.getIndex = function() {
		return me.index;
	};
	
	this.setIndex = function(index) {
		var e;
		if ('number' == app.type(index) && index > -1) {
			e = $(me.tab_selector + ':eq(' + index + ')');
			if (!e.hasClass(me.tab_class)) {
				e.addClass(me.tab_class).siblings('.' + me.tab_class).removeClass(me.tab_class);
				
				e = $(me.tabed[index]);
				if (e.length) {
					e.addClass(me.tabed_class).show().siblings('.' + me.tabed_class).removeClass(me.tabed_class).hide();
				} else {
					e.siblings('.' + me.tabed_class).hide();
				}
			}
			
			me.index = index;
		} else {
			log('ui.tab Tab.update(index) index is illegal, which should be a number bigger than -1');
		}
	};
	
	etag = data.etag || 'click';
	me.tab_selector = tab;
	me.tab = $(me.tab_selector);
	me.tab_class = data.tab_class || 'ui_tab_selected';
	me.tabed = $(data.tabed);
	me.tabed_class = data.tabed_class || 'ui_tab_selected';

	if (!me.tab.length) {
		log('ui.tab() length of tab is 0');
	}
	
	if (!me.tabed.length) {
		log('ui.tab() length of tabed is 0');
	}
	
	me.tab.bind(etag, function() {
		me.setIndex($(this).index());
	});
	
	me.tabed.hide();
	me.setIndex(data.index || 0);
};

Tab.selector = {};
// core end

// business start
/**
 * create a button
 * 		data = {
 * 			text : '',
 * 			klass : '',
 * 			id : ''
 * 		}
 * 		or data = 'text'
 * */
ui.button = function(data) {
	var html = app.type(data), id, klass, cs = {'ok' : 'button_ok', 'cancel' : 'button_cancel'};
	
	if ('string' == html) {
		data = {text : data};
	} else if ('object' != html) {
		log('ui.button(data) param data should be a string or an object');
		data = {text : ''};
	}
	
	app.isNU(data.text) ? data.text = '' : '';
	
	html = '';
	klass = cs[data.klass] || data.klass || 'button_cancel';
	id = data.id || 'ui_button' + app.randString(10);
	
	return html + '<a id="' + id + '" class="' + klass + '"><span>' + data.text + '</span></a>';
};

ui.dialog = function (data) {
	app.isObj(data) ? '' : data = {content : data};
	return new Dialog(data);
};

ui.dialogLogin = function() {
	$('#ico_sync_rotate').hide();
	
	ui.dialog({
		id : 'user_invalid',
		once : true,
		hide_outside : false,
		close : false,
		content : '<div class="logout_dialog">'
				+'<div class="logout_title" langid="cc_sys_account_logout">' + app.getLangText('cc_sys_account_logout') + '</div>'
				+'<div class="logout_content">'
					+'<div class="logout_warn_icon"></div>'
					+'<a class="button_ok"><span langid="cc_sys_relogin">' + app.getLangText('cc_sys_relogin') + '</span></a>'
				+'</div>'
			+'</div>'
	}).dom.find('.button_ok').click(function() {
		location.href = '/user/login';
	});
};

/**
 * @param img a html img tag
 * */
ui.dialogContact = function(img) {
	var src, html, dialog_img, width, height, fail, winheight;
		
	winheight = document.documentElement.clientHeight;
	img = $(img);
	src = img.attr('src');
	
	if (!img.length || 1 == img.attr('fail') || !src || src.indexOf(app.static_domain) > -1) {
		img.css('cursor', 'default');
		return;
	}

	html = '<img src="' + src + '" />';

	dialog_img = ui.dialog({
		close : false,
		once : true,
		border : false,
		background : false,
		content : html,
		middle : true
	});
	
	var large_img = dialog_img.dom.find('img');
	
	large_img.css({'max-height' : winheight, 'max-width' : winheight});
	
	//判断是否是背面图片的大图，背面图片大图短边长度和正面图片对应边长度相等
	if($('#cardImg_btn li:eq(1)').hasClass('cardImg_current')) {
		var frontwidth, frontheight, frontsrc, backwidth, backheight, largeheight;
		var front_img = $('#cardImg_front img');
		var front_img_copy = new Image();
		var back_img = $('#cardImg_back img');
		
		frontsrc = front_img.attr('src');
		front_img_copy.src = frontsrc;
		backwidth = back_img.width();
		backheight = back_img.height();
		
		if(front_img_copy.width > front_img_copy.height) {
			frontwidth = front_img_copy.width;
			frontheight = front_img_copy.height;
		} else {
			frontwidth = front_img_copy.height;
			frontheight = front_img_copy.width;
		}
		if(0 != frontheight) {
			largeheight = frontwidth < winheight ? frontheight : winheight * frontheight / frontwidth;
		} else {
			largeheight = 'auto';
		}

		if(backwidth > backheight) {
			large_img.css('height', largeheight);
		} else {
			large_img.css('width', largeheight);
		}
	}
	
	dialog_img.resize();
	
	dialog_img.dom.bind('click', function() {
		dialog_img.hide();
	});
};

/**
 * show a toast
 * has been customized
 * 
 * @param {data}	toast data
 * 		data = {
 * 			msg : 'message',
 * 			level : 0,	// 1, 2 message level
 * 						// when level missed, the message will be treated as a server message. server message won't fade out until you close it
 * 						// or eles, it is an other message. other message will fade out itself
 * 			duration,	// toast show duration
 * 			langid : '' // language resource id
 * 		}
 * @param {duration}
 * */
/* custom html
<div id="serverMsg">
	<div id="serverMsg_busy" class="server_msg">
		<span class="msg_content">Server Msg</span>
        <span class="ico_cross_s"></span>
	</div>
	<div id="serverMsg_other" class="server_msg">
		<span id="msgOther_ico" class="ico_warn_s"></span>
		<span class="msg_content">Other Msg</span>
	</div>
</div>
*/
ui.notice = ui.toast = function(data) {
	var msg, level, duration, langid, toast, element = '';
	var levels = ['ico_msg_s', 'ico_warn_s', 'ico_ok_s'];

	app.isObj(data) ? '' : data = {msg : data};
	msg = data.msg || '';
	if (!msg) {
		return;
	}
	level = data.level;
	duration = data.duration || 5000;
	langid = data.langid || '';
	
	toast = ui.toast;
	if (!toast.server_msg) {
		toast.server_msg = $('#serverMsg_busy');
		toast.other_msg = $('#serverMsg_other');
		
		toast.server_msg.find('.ico_cross_s').click(function() {
			toast.server_msg.slideUp(400);
		});
	}
	
	if (app.isNU(level)) {
		// server message
		toast.server_msg.find('.msg_content').html(msg);
		toast.server_msg.slideDown(400);
	} else {
		toast.dom = toast.other_msg;
		if (!toast.dom.length) {
			element = element +
				'<div id="_ui_toast" style="display:none;width:100%;position:fixed;top:0;left:0;text-align:center;padding:7px 0;color:white;background:#383838;">'
					+'<div class="msg_content" style="color:white;"></div>'
				+'</div>';
			toast.dom = $(element).appendTo('body');
		}
		
		toast.dom.find('#msgOther_ico').attr('class', levels[level]);
		toast.dom.find('.msg_content').html(msg).attr('langid', langid);
		if (toast.timeout) {
			clearTimeout(toast.timeout);
		} else {
			toast.dom.slideDown(400);
		}
		
		toast.timeout = setTimeout(function () {
			toast.dom.slideUp(400);
			toast.timeout = null;
		}, duration);
	}
};

ui.toastCommon = function(langid, level) {
	ui.toast({
		msg : app.getLangText(langid) || 'sever busy',
		level : level
	});
};

ui.popup = function(data) {
	/**
	 * popup menu
	 * 
	 * @param {data}	object
	 * 		data = {
	 * 			ele : ele, // element_id or Element
	 * 			etag : 'click', // event tag, default 'mouseover'
	 * 			popup : popup, // popup menu element_id or element
	 * 			duration : 1000 // popup down time
	 * 			delay : 0 // 延迟时间后触发
	 * 		}
	 * */
	
	var ele, etag, popup, duration, delaytime;
	var delay = data.delay || 0;
	ele = data.ele;
	etag = data.etag || 'mouseover';
	popup = data.popup;
	duration = 'number' == app.type(data.duration) ? data.duration : data.duration ? parseInt(data.duration, 10) : 500;
	
	ele = app.isStr(ele) ? $('#' + ele) : $(ele);
	popup = app.isStr(popup) ? $('#' + popup) : $(popup);
	
	if (!popup.length) {
		return log(['ui.popup element not found.', data]);
	}
	
	if (ele[0].popuped) {
		return log(['ui.popup element has popuped.', ele[0]]);
	}
	
	ele[0].popuped = true;
	
	ele.bind(etag, function() {
		var ic, me = $(this);
		
		if ('none' == popup.css('display')) {
			ui.clearPopup();
			popup_list = popup;
			function popupShow() {
				popup.fadeIn(duration);
			}
			
			// 拖动过程中不能有弹出菜单
			if (document.moving) {
				return;
			}
			
			if (ua.web && delay) {
				delaytime = setTimeout(popupShow, delay);
			} else {
				/*
				// set timeout
				popup[0].timeout = setTimeout(function() {
					popup.fadeOut(duration);
				}, 2000 + duration);
				 */
				
				// popup is not showing, show popup
				popupShow();
			}
			
			
			if (!ua.web) {
				// 手机,平板
				popup[0].timeout = setTimeout(function() {
					popup.fadeOut(duration);
				}, 5000);
			}
		}
	});
	
	// web 用户
	if (ua.web) {
		ele.bind('mouseleave', function() {
			clearTimeout(delaytime);
			if ('block' == popup[0].style.display) {
				popup[0].timeout = setTimeout(function() {
					popup.hide();
				}, 2000 + duration);
			}
		});
		
		popup.bind('mouseleave', function() {
			// set timeout
			popup[0].timeout = setTimeout(function() {
				popup.hide();
			}, 500);
		}).bind('mouseenter', function() {
			clearTimeout(popup[0].timeout);
		});
	}
};

ui.clearPopup = function() {
	if (popup_list[0]) {
		clearTimeout(popup_list[0].timeout);
		popup_list.css('display', 'none');
		popup_list = [];
	}
};

/**
 * @param {data}
 * 		data = {
 * 			tab : '#tab li', // selector to trigger event
 * 			tabed : '#show li', // selector to show tab content
 * 			etag : 'click', // event tag, default 'click'
 * 			tab_class : 'ui_tab_selected', // default 'ui_tab_selected'
 * 			tabed_class : 'ui_tab_selected' // default 'ui_tab_selected'
 * 			index : 0	// initial visible tab
 * 		}
 * */
ui.tab = function(data) {
	return app.isObj(data) ? new Tab(data) : log('ui.tab(data) data should be an object');
};

ui.keys = {
48:1,49:1,50:1,51:1,52:1,53:1,54:1,55:1,56:1,57:1,
65:1,66:1,67:1,68:1,69:1,70:1,71:1,72:1,73:1,74:1,75:1,76:1,77:1,78:1,79:1,80:1,81:1,82:1,83:1,84:1,85:1,86:1,87:1,88:1,89:1,90:1,
96:1,97:1,98:1,99:1,100:1,101:1,102:1,103:1,104:1,105:1,106:1,107:1,109:1,110:1,111:1,
186:1,187:1,188:1,189:1,190:1,191:1,192:1,219:1,220:1,221:1,222:1
};

ui.placeholder = function(input, holder) {
	if (!input || !holder) {
		return log('ui.placeholder(input, water) param input and water are required');
	}
	
	input = input + '' == input ? $('#' + input) : $(input);
	holder = holder + '' == holder ? $('#' + holder) : $(holder);
	
	if (!input.length) {
		return log('ui.placeholder(input, water) param input is not found');
	}
	
	if (!holder.length) {
		return log('ui.placeholder(input, water) param holder is not found');
	}

	/*if (input.prop('placeholder') != null) {
		isapp.translate.addCallback(function(langid) {
			input.attr('placeholder', holder.html());
		});

		input.attr('placeholder', holder.html());
		holder.hide();

		return;
	}*/

	if (ua.ie) {
		var updateHolder = input[0].onpropertychange = function() {this.value ? holder.hide() : holder.show();};
	    input.keyup(updateHolder);
	    input.blur(updateHolder); 
	} else {
		input.bind('input', function(e) {this.value ? holder.hide() : holder.show();});
		input[0].updateHolder = function(force) {force ? holder.hide() : this.value ? holder.hide() : holder.show();};
	}
	
	input[0].id && holder.attr('for', input[0].id);
};

ui.open = function(url) {
	return null != url && window.open(url, '_blank');
};

ui.isBlocked = function(jq) {
	return jq && jq.css ? 'block' == jq.css('display') : 'block' == $(jq).css('display');
};

ui.reBorder = function(selector) {
	$(selector).bind('focus', function() {
		$(this).parent('.input_311').addClass('input_blue_311');
	}).bind('blur', function() {
		$(this).parent('.input_311').removeClass('input_blue_311');
	});
};

ui.showQRCode = function(type) {
	var html;

	switch (type) {
		case 'CamCard' : {
			isui.dialog({
				content : '<img src="//' + isapp.static_domain + '/camcard/images/qr_camcard.jpg" width="258" height="258"/>',
				once : true
			});

			break;
		}
		case 'CamScanner' : {
			isui.dialog({
				content : '<img src="' + isapp.static_domain + '/camscanner/images/qrcode_for_CS.jpg" width="430" height="430"/>',
				once : true
			});
			
			break;
		}
	}
};

ui.tabs = function(/*{
	tabs : '#tabs .tab',
	contents : '#contents .content',
	etag : 'click', // default 'click'
	focusClass : 'select', // default 'select'
	change : function(tab, content, index) {}
}*/ options) {
	options ? 0 : options = {};

	var tabs = $(options.tabs), contents, focusClass, change;

	if (!tabs.length) {
		return;
	}

	contents = $(options.contents);
	focusClass = options.focusClass || 'select';
	change = options.change || Empty;

	tabs.bind(options.etag || 'click', function() {
		var me = $(this), index, current;

		if (me.hasClass(focusClass)) {
			return;
		}

		index = isapp.index(tabs, me[0]);
		current = me.addClass(focusClass).siblings('.' + focusClass).removeClass(focusClass);

		contents.eq(isapp.index(tabs, current[0])).hide();
		contents.eq(index).show();

		change(me, contents.eq(index).show(), index);

	}).filter('.' + focusClass + ':eq(0)').trigger('click');
	
	return tabs;
};
// business end

//-- get current mouse point.
/**
 * @see isapp.getMousePosition
 * */
/*
function getMousePoint(ev){
	var x=y=0;
	if (typeof window.pageYOffset!= 'undefined') {
		x = window.pageXOffset;
		y = window.pageYOffset
	}
	else 
		if (typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
			x = document.documentElement.scrollLeft;
			y = document.documentElement.scrollTop
		}
		else 
			if (typeof document.body != 'undefined') {
				x = document.body.scrollLeft;
				y = document.body.scrollTop;
			}
	if(!ev) ev=window.event;
	x += ev.clientX;
	y += ev.clientY;
	return {'x':x,'y':y};
};
*/

/**
 * popup menu
 * 
 * @param {data}	object
 * 		data = {
 * 			ele : ele, // element_id or Element
 * 			etag : 'click', // event tag, default 'click'
 * 			popup : popup, // popup menu element_id or element
 * 			duration : 1000 // popup down time
 * 			delay : 0 // 延迟时间后触发
 *			x : 20    //确定菜单的x轴向的位置，原点为鼠标点击位置，向右为正方向. default: 10
 *			y : 10   //确定菜单的y轴向的位置，原点为鼠标点击位置，向下为正方向. default: 10
 *			fixed : 0 //弹出菜单是否在固定位置，还是会随着鼠标的点击位置发生变化.default: 0 不在固定位置 
 *			is_scroll : 是否在滚动窗体中，default：0 不在滚动窗体中, 1: y轴方向上滚动, 2： x轴方向上滚动
 *			id_scroll : 滚动窗体的id号
 * 		}
 * */
ui.right_popup = function(data) {
	var ele, etag, popup, duration, delaytime, lct_x, lct_y, func, fixed, is_scroll, id_scroll;
	var delay = data.delay || 0;
	ele = data.ele;
	etag = data.etag || 'click';
	popup = data.popup;
	func = data.func || '';
	duration = 'number' == app.type(data.duration) ? data.duration : data.duration ? parseInt(data.duration, 10) : 500;
	lct_x = data.x || 10;
	lct_y = data.y || 10;
	fixed = data.fixed || 0;
	is_scroll = data.is_scroll || 0;
	id_scroll = data.id_scroll;
	
	ele = app.isStr(ele) ? $('#' + ele) : $(ele);
	popup = app.isStr(popup) ? $('#' + popup) : $(popup);
	
	if (!popup.length) {
		return;
	}
	
	if (ele[0].popuped) {
		return;
	}
	
	ele[0].popuped = true;
	ele.live(etag, function(e) {
		var ic, me = $(this);
		popup.css("display","none");  
		if ('none' == $(popup[0]).css('display')) {
			if(fixed) {
				function CPos(x, y)
				{
					this.x = x;
				    this.y = y;
				}
				/**
				* 得到对象的相对浏览器的坐标
				*/
				function GetObjPos(ATarget)
				{
					var target = ATarget;
					var pos = new CPos(target.offsetLeft, target.offsetTop);
				       
					var target = target.offsetParent;
					while (target)
					{
						pos.x += target.offsetLeft;
				        pos.y += target.offsetTop;
				           
				        target = target.offsetParent
				    }
					return pos;
				}
				    
				var x = GetObjPos($(this)[0])['x'];
				var y = GetObjPos($(this)[0])['y'];
				
				if(is_scroll == 1)	{
					y = y - $('#' + id_scroll).scrollTop();
				}else if(is_scroll == 2) {
					x = x - $('#' + id_scroll).scrollLeft();
				}
			}else {
				var x = isapp.getMousePosition(e).x;
				var y = isapp.getMousePosition(e).y;	
			}
			popup.css("left",(x + lct_x) + "px");  
			popup.css("top", (y + lct_y) + "px");
			ui.clear_RightPopup();
			popup_list = popup;
			function popupShow() {
				popup.fadeIn(duration);
			}
			
			// 拖动过程中不能有弹出菜单
			if (document.moving) {
				return;
			}
			
			if (ua.web && delay) {
				delaytime = setTimeout(popupShow, delay);
			} else {
				popupShow();
			}
			
			
			if (!ua.web) {
				// 手机,平板
				popup[0].timeout = setTimeout(function() {
					popup.fadeOut(duration);
				}, 5000);
			}
		}
		func? func($(this).attr('id')) : '';
		return false;
	});
	
	// web 用户
	if (ua.web) {
		ele.bind('mouseleave', function() {
			clearTimeout(delaytime);
//			if ('block' == popup[0].style.display) {
//				popup[0].timeout = setTimeout(function() {
//					popup.hide();
//				}, 2000 + duration);
//			}
		});
		
		popup.bind('mouseleave', function() {
			// set timeout
			popup[0].timeout = setTimeout(function() {
				popup.hide();
			}, 500);
		}).bind('mouseenter', function() {
			clearTimeout(popup[0].timeout);
		});
	}
};

ui.clear_RightPopup = function() {
	if (popup_list[0]) {
		clearTimeout(popup_list[0].timeout);
		popup_list.css('display', 'none');
		popup_list = [];
	}
};

ui.color = {
	tohex : function(color) {
		var hex = '';
		
		if (color) {
			color = color.r == null ? color = isapp.trim(color) : 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
			
			if (/^rgb/i.test(color)) {
				color = color.match(/^rgba?\(([\d.\s]+),([\d.\s]+),([\d.\s]+)/i);
				if (color && 4 == color.length) {
					color[1] = toHexStr(color[1]);
					color[2] = toHexStr(color[2]);
					color[3] = toHexStr(color[3]);
					hex = color[1] + color[2] + color[3];
				}
			} else if (/^#?[0-9a-f]{6}$/i.test(color)) {
				hex = color.replace(/^#/, '');
			} else if (/^#?[0-9a-f]{3}$/i.test(color)) {
				color = color.replace(/^#/, '');
				hex = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
			}
		}
		
		// 转两位16进制数, 十位补齐
		function toHexStr(num) {
			return (num < 16 ? '0' : '') + parseInt(num).toString(16);
		}
		
		return hex || '000000';
	},
	torgb : function(color) {
		var rgb;
		
		color = color.r == null ? color = isapp.trim(color) : 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
		
		if (/^rgb/i.test(color)) {
			color = color.match(/^rgba?\(([\d.\s]+),([\d.\s]+),([\d.\s]+)/i);
			if (color && 4 == color.length) {
				rgb = {
					r : color[1],
					g : color[2],
					b : color[3]
				};
			}
		} else {
			3 == color.length ? color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2] : 0;
			
			if (6 == color.length) {
				rgb = {
					r : subHexInt(color, 0, 2),
					g : subHexInt(color, 2, 2),
					b : subHexInt(color, 4, 2)
				};
			}
		}
		
		function subHexInt(str, start, length) {
			return parseInt(str.substr(start, length), 16) || 0;
		}
		
		return rgb || {r : 0, g : 0, b : 0};
	},
	rgb2hex : function(rgb) {
		return ui.color.tohex(rgb);
	},
	hex2rgb : function(hex) {
		return ui.color.torgb(hex);
	}
}

this.isui = ui;
})();

/**
 * jQuery 扩展
 * */
(function($) {
	/**
	 * input 事件, 当 input 内容变化时触发函数, 包括粘贴、剪切导致的 value 改变.
	 * 同时无关的 keyup 不会触发, 比如光标键
	 * */
	$.fn.input = ua.ie ? function (callback) {
		return this.bind('propertychange keyup input', callback);
	} : function (callback) {
		return this.bind('input', callback);
	};

	/**
	 * 回调可以接收 一个 offset, offset 以页面左上角为基准 offset = {x : 0, y : 0}
	 * @param  options = {
	 * 				child : 'selector' // or jQuery object,
	 *				axis : 'x|y', // default both
	 * 				drag : function(item, offset) {}, // if this callback return false, drag is prevented
	 * 				dragStart : function(item, offset) {},
	 * 				dragEnd : function(item) {}
	 * 			}
	 * 所有回调 this = $.fn.this, 接收的第一个参数是 drag_item
	 * */
	$.fn.drag = function(/*
			{
				child : 'selector' // or jQuery object,
				axis : 'x|y', // default both
				drag : function(item, offset) {}, // if this callback return false, drag is prevented
				dragStart : function(item, offset) {},
				dragEnd : function(item) {}
			}
		*/options) {

		var me = this, doc, body,
			drag, dragStart, dragEnd, returnFalse, axis, cursor,
			child, drag_item, dragUp, dragMove, start_x, start_y;

		if (!options || !options.child) {
			return me;
		}

		child = isapp.isStr(options.child) ? me.find(options.child) : $(options.child);
		if (child.length < 1) {
			return me;
		}

		doc = $(document);
		body = $(document.body);
		start_x = start_y = 0;
		cursor = options.cursor || 'pointer';
		drag = typeof options.drag == 'function' ? options.drag : Empty;
		dragStart = typeof options.dragStart == 'function' ? options.dragStart : Empty;
		dragEnd = typeof options.dragEnd == 'function' ? options.dragEnd : Empty;
		returnFalse = isapp.returnFalse;

		if (options.axis) {
			options.axis == 'x' ? axis = 1 : 0;
			options.axis == 'y' ? axis = -1 : 0;
		}

		(ua.ie || ua.ff) && me.find('img').bind('dragstart', returnFalse);

		dragUp = function() {
			if (!drag_item) {
				return;
			}

			var item = drag_item[0];

			drag_item = false;
			me.unbind('mousemove', dragMove);
			doc.unbind('mouseup', dragUp);
			body.css('cursor', '').unbind('selectstart', returnFalse);
			ua.ff && me.unbind('selectstart', returnFalse);

			dragEnd.call(me, $(item));
		};

		dragMove = function(evt) {
			if (!drag_item) {
				return;
			}

			var offset = isapp.getMousePosition(evt), ret;

			offset.x -= start_x;
			offset.y -= start_y;
			ret = drag.call(me, drag_item, offset);

			if (false === ret) {
				return;
			}

			if (ret) {
				ret.x == null ? 0 : offset.x = ret.x;
				ret.y == null ? 0 : offset.y = ret.y;
			}

			if (axis) {
				axis == 1 ? drag_item.css('left', offset.x) : drag_item.css('top', offset.y);
			} else {
				drag_item.css('left', offset.x).css('top', offset.y);
			}
		};

		child.bind('mousedown', function(evt) {
			if (evt.which !== 1) {
				return;
			}

			drag_item = $(this);

			var offset = isapp.getMousePosition(evt), position = drag_item.position();

			start_x = offset.x - position.left;
			start_y = offset.y - position.top;

			dragStart.call(me, drag_item, {
				left : start_x,
				top : start_y
			});

			ua.ff && me.bind('selectstart', returnFalse);
			body.css('cursor', cursor).bind('selectstart', returnFalse);

			me.bind('mousemove', dragMove);
			doc.bind('mouseup', dragUp);
		});

		return me;
	};

	$.fn.integer = function(/*
			{
				up : 'selector',
				down : 'selector',
				max : 10,
				min : 0,
				writable : true, // 是否可以直接输入
				change : callback
			}
		*/options) {

		var me = this, val, val_access,
			adjust, callback,
			max, min;

		if (!me.length || !options) {
			return me;
		}

		val = me.get(0).nodeName.toLowerCase();
		val_access = val == 'input' || val == 'textarea' ? 'val' : 'html';

		max = typeof options.max == 'number' ? options.max : 100;
		min = typeof options.min == 'number' ? options.min : 0;
		options.writable == false ? me.attr('readonly', 'readonly') : 0;
		callback = isapp.isFn(options.change) ? options.change : Empty;

		if (max < min) {
			max = max + min;
			min = max - min;
			max = max - min;
		}

		$(options.up).bind('mousedown', function(evt) {
			evt.which === 1 && adjust('up');
		});

		$(options.down).bind('mousedown', function(evt) {
			evt.which === 1 && adjust('down');
		});

		me.bind('contextmenu', isapp.returnFalse).bind('keyup', function(evt) {
			return adjust(evt.which);
		}).bind('blur', function() {
			return adjust();
		});

		adjust = function(type) {
			var val = me[val_access](), integer, ret;

			if (val == '') {
				return;
			}

			integer = parseInt(val.replace(/\D/g, ''));
			if (isNaN(integer)) {
				integer = min;
			} else {
				// 'up', 'down' user click
				if ('up' == type) {
					integer++;
				} else if ('down' == type) {
					integer--;
				} else {
					// user input, type is evt.which
					if (type) {
						if (integer > max || integer < min) {
							return;
						}
					}
				}
			}

			// max, min fix
			integer > max ? integer = max : integer < min ? integer = min : 0;

			ret = callback.call(me, integer);

			if (ret === false) {
				return;
			}

			ret === undefined ? 0 : integer = ret;
			val == integer ? 0 : me[val_access](integer);
		}
	};
})(jQuery);