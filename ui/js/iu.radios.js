/**
* author  : stella
* date    : 2015-2-10
* program : iu.radio.js
**/
iu.widget('radio',{
	init : function(text){
		var self = this,
			options = self.options;

		options.whichChoose = options.whichChoose ? options.whichChoose : 0;
		options.radio_text = options.radio_text ? options.radio_text : "";

		self._createRadio();
	},
	destroy : function(){
		var self = this,
			options = self.options,
			events = self.events,
			key,
			element = self.element,
			radios = element.find('div.iu_radio_button');
		//解除所有radio的事件和内容
		radios.each(function(){
			$(this).unbind('click', events.clickButton);
		});

		element.html('');
		element.attr('style',"");	
	},
	_createRadio : function(){
		var self = this,
			options = self.options,
			element = self.element;
			if(options.radio_text){
				self.addRadio(options.radio_text,"");
			}
	},
	events : {
		clickButton : function(e){
			var self = this,
				options = self.options,
				radio_button = $(e.target).closest('div.iu_radio_button'),
				key,
				curcallback;

			if (!radio_button.hasClass("iu_radio_select")) {
				radio_button.siblings(".iu_radio_button").removeClass("iu_radio_select");
				radio_button.addClass("iu_radio_select");
				options.whichChoose = radio_button.index();

				key = radio_button.attr('radio_index');
				curcallback = options.radioArr[key].callback;
				if (curcallback) {
					curcallback(e);
				};

			}else if (options.istoggle) {

				radio_button.removeClass("iu_radio_select");
				options.whichChoose = radio_button.index();

			}

			
		}
	},
	setOption : function(key,value){
		var self = this,
			options = self.options,
			index,
			item;
			element = self.element;
		if (arguments.length == 1) {
			self.options.text = key;
			return;
		}
		switch(key){
			case 'callback':{

							if ((typeof value)!="function"){
								options.callback = arguments[2];
								if ((typeof options.callback)!="function") {
									options.callback = null;
								};

								index = value;
								options.radioArr[index].callback = options.callback;
								break;
							}

							if ((typeof value)=="function") {

								for (item in options.radioArr) {
									options.radioArr[item].callback = value;				
								}						
							};				

			}
			case 'radios':{

							if (!value) {
								return;
							};

							for (item in value){
								self.addRadio(value[item].text,value[item].value,value[item].callback,value[item].properties);
							}

							break;

			}
			case 'addelement':{

								if(arguments.length<3){
									break;
								}

								index = arguments[1]+1;
								element = $(arguments[2]);
								element.find("div.iu_radio_button:nth-child("+index+")").append(element);

			}
			default:
				break;
		}
		
	},
	addRadio : function (text,value,fun,properties){
		var self = this;
		self._createRadioButton(text,value,fun,properties);
	},
	getValue : function(){
		var self = this,
			options = self.options,
			whichChoose = options.whichChoose;

		return options.radioArr[whichChoose].value;
	},
	_createRadioButton : function(){
		var self = this,
			options = self.options,
			selector = self.element,
			text = arguments[0],
			value = arguments[1],
			properties = [],
			callback,
			key;

			if (arguments[2] == "undefined") {
				callback = null;
				properties = [];
			}
			if (arguments[2] && !arguments[3]) {
				callback = arguments[2];
				if ((typeof callback)!="function") {
					callback = null;
					properties = arguments[2];
				};
			};

			if (arguments[3]) {
				callback = arguments[2];
				properties = arguments[3];
			}

			radio_button = $('<div class="iu_radio_button ib" radio_index="' + options.radioArr.length + '">'
					    		+'<span class="iu_radio_input"></span>'
        						+'<span class="iu_radio_text hidelong" title="'+CP.quot_to_text(text)+'">'+text+'</span>'
        						+'<span class="personal_tag_num"></span>'
        						+'<span class="tag_num_plusone" style="display:none"></span>'
    						+'</div>');

			radio_button.attr('value',value);
			if(properties){
				for (key in properties) {
					radio_button.attr(key,properties[key]);
				}
			}
			$(selector).append(radio_button);

			radio_button.bind('click', this.events.clickButton);

			//把radio对象传进数组
			options.radioArr.push({"radio_button":radio_button,"value":value,"callback":callback,"properties":""});

			//设置初始值
			if (options.whichChoose < options.radioArr.length) {

				if (radio_button.attr('radio_index') == options.whichChoose) {
					$(radio_button).addClass("iu_radio_select").siblings(".iu_radio_button").removeClass("iu_radio_select");
				}
			}
	},
	options : {
		text : null,
		selector : null,
		whichChoose : null,//初始化默认选中下标;<0 : 没有默认选中;不填 : 默认是第一个选中;
		radio_text : null,
		radio_id : null,
		radioArr : [],
		istoggle : false//重复点击是否去除选中
	}
});