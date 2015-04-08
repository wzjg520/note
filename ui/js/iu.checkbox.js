/**
* author  : stella
* date    : 2015-2-11
* program : iu.checkbox.js
**/
iu.widget('checkbox',{
	init : function(text){
		var self = this,
			options = self.options,
			element = self.element;

		options.choose_callback = options.choose_callback ? options.choose_callback : null;
		options.unchoose_callback = options.unchoose_callback ? options.unchoose_callback : null;
		self._createCheckbox();
	},
	destroy : function(){
		var self = this,
			options = self.options,
			events = self.events,
			element = self.element;

			element.unbind('click',events.clickButton);
			element.empty();

		//unbind event and recover tag
	},
	_createCheckbox : function(){
		var self = this,
			options = self.options,
			events = self.events,
			element = self.element,
			checkbox,
			id;

			checkbox = $('<span class="iu_checkbox_input"></span>');

			id = element.attr("id");
			checkbox.attr("id",id);
			//是否可选
			if(!options.canChoose){
				checkbox.addClass("disabled");
			}else{
				checkbox.removeClass("disabled");
			}

			//选中状态初始化
			if(options.isChoose){
				checkbox.addClass("iu_checkbox_check");
			}

			checkbox.bind('click',events.clickButton);
			//replace
			element.replaceWith(checkbox);
	},
	events : {
		clickButton : function(e){
			var self = this,
				options = self.options,
				checkbox = $(e.target);

			//checkbox disable
			if(!options.canChoose){
				return;
			}
			//checkbox active
			if (!checkbox.hasClass("iu_checkbox_check")) {

				checkbox.addClass("iu_checkbox_check");
				options.isChoose = true;

				if(options.choose_callback){
					options.choose_callback(e);
				}

			}else{

				checkbox.removeClass("iu_checkbox_check");
				options.isChoose = false;

				if(options.unchoose_callback){
					options.unchoose_callback(e);
				}
			}
		}
	},
	setOption : function(key,value){
		var self = this,
			options = self.options;
			element = self.element;
		if (arguments.length == 1) {
			return;
		}
		switch(key){
			case 'choose_callback'	: {

								if ((typeof value) == "function") {
									options.choose_callback = value;
								}
								break;

							}
			case 'unchoose_callback'	: {

								if ((typeof value) == "function") {
									options.unchoose_callback = value;
								}
								break;

							}
			case 'css'		: {
						
								element.addClass(value);
								break;
							}
			case 'canChoose': {
								options.canChoose = value;
								if(!options.canChoose){
									heck_button.addClass("disabled");
									break;
								}
								check_button.removeClass("disabled");
								break;
							}
			default:
				break;
		}
		
	},
	isCheck : function(){
		var self = this,
			options = self.options;

		return options.isChoose;
	},
	options : {
		text : null,
		selector : null,
		isChoose : false,//true for choosen, false for unchoose
		choose_callback : null,
		canChoose : true,
		unchoose_callback : null
	}
});