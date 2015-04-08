/**
 * iu.tree.js
 * */
iu.widget('tree', {
	init : function() {
		var self = this,
			options = self.options;

		self._createTree();
		
	},
	destroy : function() {
		var self = this;
		self.remove();
	},

	_createTree : function() {
		var self = this,
			options = self.options,
			data = options.data,
			target = self.element;
		
		options.showIcon?0:target.addClass('no_icon');
		target.addClass('iu_tree').addClass('level0').attr('level','0');

		self.render(data);
	},
	
	_appendNode : function(dom,node){
		var self = this,
			target = self.element,
			pId = node.pId,
			options = self.options;
		if(pId == undefined){
			target.append(dom);
		}else{
			var parent = target.find('#node_'+pId);
			if(parent.next('ul').length == 0){
				var ul = self._createUl(pId);
				parent.after(ul);
			}
			parent.next('ul').append(dom);
		}
	},
	getdata : function(){
		return this.options.data;
	},
	getSelectedNodeId : function(){
		var id = this.element.find('.selected').attr('id');
		return id?id.substr(5):null;
	},
	_createInput : function(node,cb){
		var options = this.options;
		var name = node.name,
			icon = node.icon;

		var li = $("<li/>").addClass('tree_new');

		var a = $("<a/>");
		var span = $('<span/>');
		span.addClass('pre');
		a.append(span);
		icon?a.append($('<span/>').addClass(icon).addClass('icon')):0;

		a.append($('<input>').val(name).addClass('tree_input'));
		a.append($('<span/>').addClass('confirm'));
		a.append($('<span/>').addClass('cancel'));

		li.append(a);
		
		return li;
	},
	_createNode : function(node){
		var options = this.options;
		var id = node.id,
			name = node.name,
			open = node.open,
			icon = node.icon;

		var li = $("<li/>");
		
		var a = $("<a/>").attr({'id':'node_'+id,node_id:id}).addClass('node');
		var span = $('<span/>');
		open?a.addClass('open'):0;
		span.addClass('pre');
		a.append(span);
		icon?a.append($('<span/>').addClass(icon).addClass('icon')):0;
		a.append($('<span/>').html(name));

		li.append(a);
		
		return li;
	},
	_createUl : function(pId){
		return $('<ul/>').attr({'ul_id':pId});
	},

	_getnode : function(file_id){
		var data = this.options.data;
		for(var i = 0;i<data.length;i++){
			if(data[i]['id'] == file_id){
				return data[i];
			}
		}
		return null;
	},

	_addLine : function(){
		var self = this,
			target = self.element,
			options = self.options;

		target.find('li').each(function(i,e){
			var file_id = $(e).children('a').attr('node_id'),
				node = self._getnode(file_id),
				num = node?node['num']:0;

			var has_switch = $(e).children('a').next('ul').length || num>0,
				parent = $(e).parent(),
				children = $(e).parent().children('li'),
				klass,
				level = 1*parent.attr('level')+1;

			//根节点
			if(parent.attr('id') == $(target).attr('id') && children.length == 1){
				klass = has_switch?'one_line_check switch':'one_line line';
			}else if(children.length == 1 || $(e).next('li').length == 0){
				klass = has_switch?'two_line_check switch':'two_line line';
			}else{
				klass = has_switch?'three_line_check switch':'three_line line';
			}
			//设置level
			if(has_switch){
				$(e).children('ul').addClass('level'+level).attr('level',level);
			}
			var t = $(e).children('.node').find('.pre');
			klass+=' pre';
			t.attr('class',klass);
		});
	},
	_bindSwitchevent : function(){
		var self = this,
			target = self.element,
			options = self.options;
			target.find('.node').each(function(){
				$(this).hasClass('open')?0:$(this).next('ul').hide();
			});
			target.delegate('.switch','click',function(){
				if($(this).parent().hasClass('open')){
					$(this).parent().removeClass('open');
					$(this).parent().next('ul').hide();
				}else{
					var once = !options.expendOnce || (!$(this).parent().attr('loaded') && options.expendOnce);
					if(options.onExpend && once){
						var id = $(this).parent().attr('node_id');
						options.onExpend(id);
					}
					$(this).parent().attr('loaded','1');
					$(this).parent().addClass('open');
					$(this).parent().next('ul').show();
				}
			});
	},
	_sort : function(data){
		for(var i =0;i<data.length;i++){
			var pid = data[i].pId;
			if(pid){
				for(var j = i + 1;j<data.length;j++){
					if(pid == data[j].id){
						var x = $.extend({},data[i]);
						data.splice(i,1);
						data.splice(j,0,x);
						i--;
						break;
					}				
				}
			}
		}
		return data;
	},
	_bindAddevent : function(cb){
		var self = this,
			target = self.element;

		target.find('.tree_new .confirm').bind('click',function(){
			var a = target.find('.tree_new'),
				name = a.find('.tree_input').val(),
				parent_id = a.parent().attr('ul_id');
			if(cb){
				cb(name,parent_id);
			}
		});

		target.find('.tree_new .cancel').bind('click',function(){
			var a = target.find('.tree_new');
			a.siblings().length == 0?a.parent().remove():a.remove();
			self._addLine();
		});
	},
	open : function(id,cb){
		var self = this,
			options = self.options,
			node = $('#node_'+id);
		
		if(node.hasClass('open')){
			if(cb){
				cb();
			}
			return;
		}

		var once = !options.expendOnce || (!node.attr('loaded') && options.expendOnce);
		if(options.onExpend && once){
			options.onExpend(id,cb);
		}else{
			if(cb){
				cb();
			}
		}
		node.attr('loaded','1').addClass('open');
		node.next('ul').show();
	},
	addNode : function(node,cb){
		var self = this,
			target = self.element,
			parent_id = self.getSelectedNodeId();
		if(!parent_id)return;
		if(target.find('.tree_new').length!=0)return;
		node['pId'] = parent_id;	
		var dom = self._createInput(node);
		self._appendNode(dom,node);
		self._addLine();
		self._bindAddevent(cb);
	},
	add : function(node){
		var self = this,
			target = self.element,
			dom = self._createNode(node);
		self.options.data.push(node);
		self._appendNode(dom,node);
		self._addLine();
		target.find('.tree_new').remove();
	},
	render : function(data){
		var self = this,
			options = self.options,
			target = self.element;

		target.empty();
		data = self._sort(data);
		if(!$.isArray(data) || data.length == 0)return;
		for(var i = 0;i<data.length;i++){
			var node = data[i];
			var dom = self._createNode(node);
			self._appendNode(dom,node);
		}
		self._addLine();
		self._bindSwitchevent();
	},
	options : {
		data:null,
		showIcon : null,
		check : null,
		radio : null,
		onExpend : null,
		expendOnce : false
	}
});