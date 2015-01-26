/**
 * iu.player.js
 * */
iu.widget('player', {
	init : function() {
		this._createPlayer();
		this.start();
	},
	destroy : function() {},
	pause : function() {
		this.clear();	
	},
	start : function() {
		var self = this;
		if(self.options.auto && !self.hoverstatus) {
			self.clear();
			self.delay(self.to, [self.currentindex + 1], self.options.switchDuration);
		}
	},
	next : function() {
		this.to(this.currentindex + 1);
	},
	prev : function() {
		this.to(this.currentindex - 1);
	},
	to : function(to) {
		var self = this,
			options = self.options,
			current = self.currentindex,
			maxnum = self.maxnum,
			player_inner = self.player_inner,
			duration = options.duration,
			animate = options.animate,
			width = player_inner.children().width();
		if(to == current) {
			return false;
		} else if(to == -1) {
			to = maxnum - 1;
		} else if(to == maxnum) {
			to = 0;
		}
		if(options.points) {
			self.points.children().eq(to).addClass('iu_player_point_selected');
			self.points.children().eq(current).removeClass('iu_player_point_selected');
		}
		self.animating = true;
		switch(animate) {
			case 'none':
				player_inner.children().eq(current).hide();
				player_inner.children().eq(to).show();
				self.finish(to);
				break;
			case 'fade':
				self.animating = true;
				player_inner.children().eq(current).fadeOut(duration);
				player_inner.children().eq(to).fadeIn(duration, function() {
					self.finish(to);
				});
				break;
			case 'slide':
				if(current == 0 && to == maxnum - 1) {
					player_inner.animate({'left' : width}, duration, function() {
						player_inner.css('left', -width*to);
						self.finish(to);
					});
				} else if(current == maxnum - 1 && to == 0) {
					player_inner.animate({'left' : - width * maxnum}, duration, function() {
						player_inner.css('left', -width*to);
						self.finish(to);
					});
				} else {
					player_inner.animate({'left' : -width * to}, duration, function() {
						self.finish(to);
					})
				}
				break;
		}
	},
	finish : function(to) {
		var self = this;
		self.currentindex = to;
		self.animating = false;
		self.start();
	},
	resize : function(width,height) {
		var self = this,
			options = self.options,
			player = self.player,
			player_inner = self.player_inner;
		if(width) {
			player.css('width', width);
			player_inner.css('width', player_inner.children().length * width);
			player_inner.children().css('width', width);
		}
		if(height) {
			player.css('height', height);
			player_inner.children().css('height', height);
		}
		if(options.animate == 'slide') {
			player_inner.css('left', -width * self.currentindex);
			var last_childs = player_inner.children().slice(0, options.childnum);
			for(var i=0; i<options.childnum; i++) {
				last_childs.eq(i).css('margin-left', - width * (options.childnum - i));
			}
		}
	},
	_createPlayer : function() {
		var self = this,
			options = self.options,
			element = self.element;

		if (!$.isArray(options.content)) {
			var content = [];
			$(options.content).each(function() {
				content.push($(this).html());
			});
			options.content = content;
		}

		self.origin_element = self.element.clone();
		self.currentindex = 0;
		self.maxnum = options.content.length;
		options.width ? 1 : options.width = element.outerWidth() + options.childmargin;
		options.height ? 1 : options.height = element.outerHeight();
		var player = $('<div class="iu_player">'
						+ '<div class="iu_player_inner"></div>'
						+ '<div class="iu_player_btn_prev"></div>'
						+ '<div class="iu_player_btn_next"></div>'
						+ '<div class="iu_player_points"></div>'
					 + '</div>'),
			player_inner = player.children('.iu_player_inner'),
			prevbtn = player.children('.iu_player_btn_prev'),
			nextbtn = player.children('.iu_player_btn_next'),
			points = player.children('.iu_player_points');
			player_single = $('<div></div>');
			point_single = $('<div class="iu_player_point"></div>');
		player.css({'width' : options.width * options.childnum - options.childmargin, 'height' : options.height, 'margin' : element.css('margin')}).attr('id', element.attr('id'));
		if(options.mobile) {
			prevbtn.css('display','block');
			nextbtn.css('display','block');
		}else{
			prevbtn.bind('selectstart', iu.tool.fail);
			nextbtn.bind('selectstart', iu.tool.fail);
		}
		//播放器位置调整
		switch(options.position) {
			case 'right':
				player.css({'margin-left' : 'auto', 'margin-right' : 0});
				break;
			case 'center':
				player.css({'margin-left' : 'auto', 'margin-right' : 'auto'});
				break;
			case 'left':
				player.css({'margin-left' : 0, 'margin-right' : 'auto'});
				break;
		}
		player_single.css({'width' : options.width, 'height' : options.height, 'display' :'none'});
		switch(options.animate) {
			case 'none':
				break;
			case 'fade':
				player_single.css({'position' : 'absolute', 'left' : 0, 'top' : 0});
				break;
			case 'slide':
				player_inner.css('width', options.width * self.maxnum);
				player_single.css({'float' : 'left', 'display' : options.display});
				break;
		}
		for(var i=0; i<self.maxnum; i++) {
			if(i == 0) {
				player_single.clone().html(options.content[i] || '').appendTo(player_inner).show();
				point_single.clone().html(options.point_content[i] || '').appendTo(points).addClass('iu_player_point_first iu_player_point_selected');
			} else {
				player_single.clone().html(options.content[i] || '').appendTo(player_inner);
				point_single.clone().html(options.point_content[i] || '').appendTo(points);
			}
		}
		if(options.animate == 'slide' && self.maxnum > options.childnum) {
			var first_childs = player_inner.children().slice(0, options.childnum).clone(),
			last_childs = player_inner.children().slice(self.maxnum - options.childnum).clone();
			for(var i=0; i<options.childnum; i++) {
				last_childs.eq(i).css('margin-left', - options.width * (options.childnum - i));
			}
			player_inner.prepend(last_childs).append(first_childs).css('width', options.width * (self.maxnum + 2 * options.childnum));
		}
		
		//绑定事件
		if(!options.mobile) {
			player.hover(function() {
				self.hoverstatus = true;
				self.pause();
				prevbtn.fadeIn(100);
				nextbtn.fadeIn(100);
			}, function() {
				self.hoverstatus = false;
				self.start();
				prevbtn.fadeOut(100);
				nextbtn.fadeOut(100);
			});
		}
		if(options.buttons) {
			if(self.maxnum > options.childnum)
			{
				prevbtn.bind('click', function() {
					if(self.animating) return false;
					self.prev();
					return false;
				});
				nextbtn.bind('click', function() {
					if(self.animating) return false;
					self.next();
					return false;
				});
			}
		} else {
			prevbtn.remove();
			nextbtn.remove();
		}
		if(options.points){
			points.children().bind('click', function() {
				if(self.animating) return false;
				self.to($(this).index());
				return false;
			});
		} else {
			points.remove();
		}
		
		self.element.replaceWith(player);
		self.player = player;
		self.player_inner = player_inner;
		self.prevbtn = prevbtn;
		self.nextbtn = nextbtn;
		self.points = points;
	},
	options : {
		content : [],
		display : 'block',
		point_content : [],
		width : null, //单个子元素宽度(非必传参数)
		height : null, //单个子元素高度(非必传参数)
		auto : true, // auto change to next
		animate : 'slide', // none|fade|slide
		switchDuration : 5000, // 切换间隔
		duration : 500, // 动画效果时长
		buttons : true, //是否有前后控制的按钮
		points : true, //是否有点击选择的按钮
		childnum : 1, //屏幕显示的子元素个数
		childmargin : 0, //子元素间距
		position: null, //播放器位置 left|center|right
		mobile : false //是否为手机页面
	}
});