/**
 * iu.clip.js
 * */
 iu.widget('clip', {
 	init : function() {
 		this._create();
 	},
 	_create:function(){
 		var ele = this.element;
 		this.box = $('<div class="iu_clip_box"></div>');
 		this.select = $('<div class="iu_clip_selection"></div>');
 		this.border = '';
 		this.handle = '';
 		this.outer  = '';
 		ele.after(this.box);
 		this.box.append(this.select);
 		for (var i = 0; i < 4; i++) {
 			this.border+='<div class="iu_clip_border iu_clip_border'+i+'"></div>';
 		};
 		this.border = $(this.border);
 		this.box.append(this.border);

 		for (var i = 0; i < 8; i++) {
 			this.handle += '<div class="iu_clip_handle"></div>';
 		};
 		this.handle = $(this.handle);
 		this.box.append(this.handle);

 		for (var i = 0; i < 4; i++) {
 			this.outer += '<div class="iu_clip_outer iu_clip_outer'+i+'"></div>';
 		};
 		this.outer = $(this.outer);
 		ele.after(this.outer);
 		
 		this.selection = { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 };
 		var img = ele[0];
 		var $img = ele;
 		var self = this;
 		img.complete || img.readyState == 'complete' || !$img.is('img') ?
 		this.events.imgload(0) : $img.one('load', function() {
 			self.events.imgload(self);
 		});
 	},

 	destroy : function() {
 		$img = this.element.unbind('mousedown',this.events.imgmousedown);
 		this.box.remove();
 		this.outer.remove();
 	},
 	show : function() {
 		this.outer.css('FILTER','alpha(opacity=40)');
 		this.outer.add(this.box).fadeIn(this.options.fadeSpeed||0);
 	},
 	hide : function() {
 		this.outer.add(this.box).fadeOut(this.options.fadeSpeed||0,function(){$(this).hide()});
 	},
 	adjust:function(){
 		if(!this.imgloaded || !this.element.width())
 			return;
 		var $img = this.element;
 		var $parent = this.element.offsetParent();
 		this.parent = $parent;
 		this.imgOfs = { left: Math.round($img.offset().left), top: Math.round($img.offset().top) };
 		this.parOfs = { left: Math.round($parent.offset().left), top: Math.round($parent.offset().top) };
 		
 		this.imgWidth = $img.width();
 		this.imgHeight = $img.height();

 		this.imgOfs.top += ($img.outerHeight() - this.imgHeight) >> 1;
 		this.imgOfs.left += ($img.outerWidth() - this.imgWidth) >> 1 ;

 		this.left = this.imgOfs.left - this.parOfs.left;
 		this.top  = this.imgOfs.top - this.parOfs.top;

 		this.minWidth = Math.round(this.options.minWidth) || 0;
 		this.minHeight = Math.round(this.options.minHeight) || 0;
 		this.maxWidth = Math.round(Math.min(this.options.maxWidth || 1<<24, this.imgWidth));
 		this.maxHeight = Math.round(Math.min(this.options.maxHeight || 1<<24, this.imgHeight));

 		if (this.selection.x2 > this.imgWidth || this.selection.y2 > this.imgHeight)
 			this.doresize();
 	},
 	update:function(){
 		if (!this.shown) return;
 		this.box.css({left:this.left+this.selection.x1,top:this.top+this.selection.y1}).add(this.border).add(this.select)
 		.css({width:this.selection.width,height:this.selection.height});

 		var $outer = this.outer;
 		$($outer[0]).css({ left: this.left, top: this.top,
 			width: this.selection.x1, height: this.imgHeight });
 		$($outer[1]).css({ left: this.left+this.selection.x1, top: this.top,
 			width: this.selection.width, height: this.selection.y1 });
 		$($outer[2]).css({ left: this.left+this.selection.x2, top: this.top,
 			width: this.imgWidth - this.selection.x2, height: this.imgHeight });
 		$($outer[3]).css({ left: this.left+this.selection.x1, top: this.top+this.selection.y2,
 			width: this.selection.width, height: this.imgHeight - this.selection.y2 });

 		var w = this.selection.width - 5,
 		h = this.selection.height - 5;

 		$handles = this.handle;
 		if(this.options.handles){
 			$($handles[4]).css({ left: w >> 1 });
 			$($handles[5]).css({ left: w -2, top: h >> 1 });
 			$($handles[6]).css({ left: w >> 1, top: h-2 });
 			$($handles[7]).css({ top: h >> 1 });
 			$handles.slice(1,3).css({ left: w-2 });
 			$handles.slice(2,4).css({ top: h-2 });
 		}else{
 			$handles.hide();
 		}


 	},
 	doresize:function(){
 		this.x1 = Math.min(this.x1, this.imgWidth);
 		this.y1 = Math.min(this.y1,this.imgHeight);

 		if (Math.abs(this.x2 - this.x1) < this.minWidth) {
 			this.x2 = this.x1 - this.minWidth * (this.x2 < this.x1 || -1);

 			if (this.x2 < 0)
 				this.x1 =  this.minWidth;
 			else if (this.x2 > this.imgWidth)
 				this.x1 = this.imgWidth - this.minWidth;
 		}

 		if (Math.abs(this.y2 - this.y1) < this.minHeight) {
 			this.y2 = this.y1 - this.minHeight * (this.y2 < this.y1 || -1);

 			if (this.y2 < 0)
 				this.y1 = this.minHeight;
 			else if (this.y2 > this.imgHeight)
 				this.y1 = this.imgHeight - this.minHeight;
 		}

 		this.x2 = Math.max(0, Math.min(this.x2, this.imgWidth));
 		this.y2 = Math.max(0, Math.min(this.y2, this.imgHeight));

 		this.fixaspectratio(Math.abs(this.x2 - this.x1) < Math.abs(this.y2 - this.y1) * this.aspectRatio);

 		if (Math.abs(this.x2 - this.x1) > this.maxWidth) {
 			this.x2 = this.x1 - this.maxWidth * (this.x2 < this.x1 || -1);
 			this.fixaspectratio();
 		}

 		if (Math.abs(this.y2 - this.y1) > this.maxHeight) {
 			this.y2 = this.y1 - this.maxHeight * (this.y2 < this.y1 || -1);
 			this.fixaspectratio(true);
 		}

 		this.selection = { x1: Math.min(this.x1, this.x2), x2: Math.max(this.x1, this.x2),
 			y1: Math.min(this.y1, this.y2), y2: Math.max(this.y1, this.y2),
 			width: Math.abs(this.x2 - this.x1), height: Math.abs(this.y2 - this.y1) };
 			this.update();

 			typeof this.options.change == 'function' ?this.options.change(this.element, this.getselection()):0;
 		},

 	getselection:function(){
 		return { x1: Math.round(this.selection.x1),
 				y1: Math.round(this.selection.y1),
 				x2: Math.round(this.selection.x2),
 				y2: Math.round(this.selection.y2),
 				width: Math.round(this.selection.x2) - Math.round(this.selection.x1),
 				height: Math.round(this.selection.y2) - Math.round(this.selection.y1) };
 		},
 	setselection:function(x1, y1, x2, y2){
 		this.selection = {
 					x1: Math.round(x1 || 0),
 					y1: Math.round(y1 || 0),
 					x2: Math.round(x2 || 0),
 					y2: Math.round(y2 || 0)
 				};

 		this.selection.width  = this.selection.x2 - this.selection.x1;
 		this.selection.height = this.selection.y2 - this.selection.y1;
 		},

 	fixaspectratio:function(xFirst) {
 		if (this.aspectRatio){
 				if (xFirst) {
 					this.x2 = Math.max(0, Math.min(this.imgWidth,this.x1 + Math.abs(this.y2 - this.y1) * this.aspectRatio * (this.x2 > this.x1 || -1)));

 					this.y2 = Math.round(Math.max(0, Math.min(this.imgHeight,this.y1 + Math.abs(this.x2 - this.x1) / this.aspectRatio * (this.y2 > this.y1 || -1))));
 					this.x2 = Math.round(this.x2);
 					}
 				else {
 					this.y2 = Math.max(0, Math.min(this.imgHeight,this.y1 + Math.abs(this.x2 - this.x1) / this.aspectRatio * (this.y2 > this.y1 || -1)));
 					this.x2 = Math.round(Math.max(0, Math.min(this.imgWidth,this.x1 + Math.abs(this.y2 - this.y1) * this.aspectRatio * (this.x2 > this.x1 || -1))));
 					this.y2 = Math.round(this.y2);
 				}
 			}
 		},
 	events : {
 		imgload:function(self){
 				this.imgloaded = true;
 				if(!self)self = this;
 				$img = self.element;

 				self.aspectRatio = (d = (self.options.aspectRatio || '').split(/:/))[0] / d[1];

 				$img.add(this.outer).mousedown(self.events.imgmousedown);

 				if(self.options.initarea != null){
 					var d = self.options.initarea;
 					self.setselection(d.x1,d.y1,d.x2,d.y2);
 					self.shown = true;
 					self.adjust();
 					self.update();
 					self.show();
 				}

 				if (self.options.resizable || self.options.movable)
 					this.box.mousemove(self.events.areamousemove).mousedown(self.events.areamousedown);

 				$(window).resize(self.update());
 				typeof self.options.create == 'function' ? self.options.create(self.element, self.getselection()) : 0; 
 				},
 		areamousemove:function(event){
 				var x = event.pageX-this.imgOfs.left - this.selection.x1,
 				y = event.pageY-this.imgOfs.top - this.selection.y1;

 				if (!this.adjusted) {
 					this.adjust();
 					this.adjusted = true;

 					this.box.one('mouseout', function () { this.adjusted = false; });
 				}

 				this.resize = '';

 				if (this.options.resizable) {
 					if (y <= this.options.resizeMargin)
 						this.resize = 'n';
 					else if (y >= this.selection.height - this.options.resizeMargin)
 						this.resize = 's';
 					if (x <= this.options.resizeMargin)
 						this.resize += 'w';
 					else if (x >= this.selection.width - this.options.resizeMargin)
 						this.resize += 'e';
 				}

 				this.box.css('cursor', this.resize ? this.resize + '-resize' :this.options.movable ? 'move' : '');

 				},
 		docmouseup:function(event){
 				$('body').css('cursor', '');
 				if (this.selection.width * this.selection.height == 0)
 					this.hide();

 				$(document).unbind('mousemove', this.events.selectingmousemove);
 				this.box.mousemove(this.events.areamousemove);

 				this.options.stop(this.element, this.getselection());
 				},
 		areamousedown:function(event){
 				var self = this;
 				if (event.which != 1) return false;
 				this.adjust();

 				if (this.resize) {
 					$('body').css('cursor', this.resize + '-resize');

 					this.x1 = this.selection[/w/.test(this.resize) ? 'x2' : 'x1'];
 					this.y1 = this.selection[/n/.test(this.resize) ? 'y2' : 'y1'];

 					$(document).mousemove(this.events.selectingmousemove)
 					.one('mouseup', this.events.docmouseup);
 					this.box.unbind('mousemove', this.events.areamousemove);
 				}
 				else if (this.options.movable) {
 					this.startX = this.selection.x1 - event.pageX;
 					this.startY = this.selection.y1 - event.pageY;

 					this.box.unbind('mousemove', this.events.areamousemove);

 					$(document).mousemove(this.events.movingmousemove)
 					.one('mouseup', function () {
 						typeof self.options.stop == 'function' ?self.options.stop(self.element, self.getselection()):0;
 						$(document).unbind('mousemove', self.events.movingmousemove);
 						self.box.mousemove(self.events.areamousemove);
 					});
 				}
 				else
 					this.element.mousedown(event);

 				return false;
 				},
 		selectingmousemove:function(event){
 				this.x2 = /w|e|^$/.test(this.resize) || this.aspectRatio ? event.pageX - this.imgOfs.left : this.selection.x2;
 				this.y2 = /n|s|^$/.test(this.resize) || this.aspectRatio ? event.pageY - this.imgOfs.top : this.selection.y2;
 				this.doresize();

 				return false;
 				},
 		domove:function() {
 				this.x2 = this.x1  + this.selection.width;
 				this.y2 = this.y1  + this.selection.height;

 				$.extend(this.selection, { x1: this.x1, y1: this.y1, x2: this.x2,y2: this.y2 });

 				this.update();

 				typeof this.options.change == 'function' ?this.options.change(this.element, this.getselection()):0;
 				},
 		movingmousemove:function(event){
 				this.x1 = Math.max(0, Math.min(this.startX + event.pageX, this.imgWidth - this.selection.width));
 				this.y1 = Math.max(0, Math.min(this.startY + event.pageY, this.imgHeight - this.selection.height));

 				this.events.domove();
 				event.preventDefault();

 				return false;
 				},
 		startselection:function(event){
 				$(document).unbind('mousemove', this.events.startselection);
 				this.adjust();

 				this.x2 = this.x1;
 				this.y2 = this.y1;

 				this.resize = '';
 				this.doresize();
 				this.shown = true;
 				this.show();

 				$(document).unbind('mouseup', this.events.cancelselection)
 				.mousemove(this.events.selectingmousemove).one('mouseup', this.events.docmouseup);
 				this.box.unbind('mousemove', this.events.areamousemove);

 				typeof this.options.start == 'function'?this.options.start(this.element, this.getselection()):0;
 				},
 		cancelselection:function(){
 				$(document).unbind('mousemove', this.events.startselection)
 				.unbind('mouseup', this.events.cancelselection);

 				this.hide();

 				this.setselection(this.x1, this.y1, this.x2, this.y2);

 				typeof this.options.change == 'function' ?this.options.change(this.element, this.getselection()):0;
 				typeof this.options.stop == 'function' ?this.options.stop(this.element, this.getselection()):0;
 				},
 		imgmousedown:function(event){
 				if (event.which != 1) return false;

 				this.adjust();
 				this.startX = this.x1 = event.pageX - this.imgOfs.left;
 				this.startY = this.y1 = event.pageY - this.imgOfs.top;

 				$(document).mousemove(this.events.startselection).mouseup(this.events.cancelselection);

 				return false;
 				}

 			},
 	options : {
 			handles:true,
 			aspectRatio:null,
 			maxWidth:null,
 			maxHeight:null,
 			minHeight:null,
 			minWidth:null,
			initarea:null,//{x1:12,y1:12,x2:23,y2:3}
			resizable:true,
			movable: true,
			resizeMargin:10,
			create: function () {},
			start: function () {},
			change: function () {},
			stop: function () {}
		}
	});