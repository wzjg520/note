/**
 * iu.promptareacode.js
 * */
iu.widget('promptareacode', 'mselect', {
	
	init : function() { 
		var self = this,
			element = self.element,
			options = self.options;
		options.langid = options.langid || navigator.language.toLowerCase() || navigator.systemLanguage.toLowerCase();
		if(-1 == options.mobile) {
			options.mobile = ua.wap;
		}
		
		var ar_codeList = self.areaCodeList[options.langid].split(','),
			ar_nameList = self.areaNameList[options.langid].split(',');
		for(var i=0; i < ar_codeList.length; i++)	{
			options.contents[i] = [];
			options.contents[i][0] = '+' + ar_codeList[i];
			options.contents[i][1] = ar_nameList[i] + ' ( +' + ar_codeList[i] + ' )';
		}
				
		if(options.mobile) {
			self._super.init();
			self._createAreaCodePromptMobile();
		} else {
			self._super.init();
			if(options.adapt == 1)	{
				element.hide();
				element.next().children().eq(0).css('width', '100%');
				element.next().children().eq(0).children().eq(0).css('width', '100%');
				element.next().children().eq(1).css('width', '100%');
			}else {
				self._createAreaCodePrompt();	
			}
			
			/* ie10 input光标bug */
			if(!element.val()) {
				element.val(' ');
				element.val('');
			}
		}
	},
	
	destroy : function() {
		var self = this;
		if(self.options.mobile) {
			self._destroyAreaCodePromptMobile();
		} else {
			self._destroyAreaCodePrompt();
		}
	},
	
	_destroyAreaCodePromptMobile : function() {
		this.element.prev().remove();
	},
	
	_destroyAreaCodePrompt : function() {
		var self = this,
			element = self.element;
		
		if(element.next().hasClass('iu_mselect_frame')) {
			// 还原element的样式
			element.css({'padding-left' : parseInt(element.css('padding-left')) - element.next().children().eq(0).outerWidth(), 'width' : element.width() + element.next().children().eq(0).outerWidth(), 'border' : self.border});
			element.next().remove();
		}	
		
	},
	
	_createAreaCodePromptMobile : function() {
		var self = this,
			element = self.element,
			options = self.options;
		
		var mselect_button = element.prev();
		mselect_button.css('width', element.width() + parseInt(element.css('padding-left')) + parseInt(element.css('padding-right'))
						+ parseInt(element.css('border-left-width')) + parseInt(element.css('border-right-width')));
	},
	
	_createAreaCodePrompt : function() {
		var self = this,
			options = self.options,
			langid = options.langid || 'zh-cn',
			element = self.element;
		
		var ac_position = element.position();
		
		var mselect_frame = element.next();
		mselect_frame.css({
			'font' : element.css('font'), 'color' : element.css('color'), 'position' : 'absolute', 'z-index' : parseInt(element.css('z-index')) + 1,
			'top' : ac_position.top + (parseInt(element.css('border-top-width')) || 0) + (parseInt(element.css('margin-top')) || 0),
			'left' : ac_position.left + (parseInt(element.css('border-left-width')) || 0) + (parseInt(element.css('margin-left')) || 0)});

		// 设置click handle的高
		var mselect_button = element.next().children().eq(0);
		
		var button_height = element.outerHeight() - parseInt(element.css('border-top-width')) - parseInt(element.css('border-bottom-width')) - parseInt(mselect_button.css('padding-top')) - parseInt(mselect_button.css('padding-bottom'))
							- parseInt(mselect_button.css('border-top-width')) - parseInt(mselect_button.css('border-bottom-width'));
		mselect_button.css({'height' : button_height, 'line-height' : button_height + 'px'});
		
		// 设置element的样式
		if(element.width() - mselect_button.outerWidth() <= 0){
			self.border = element.css('border');
			element.css({'padding-left': 0, 'width' : 0, 'border' : 0});
		}else {
			element.css({'padding-left' : mselect_button.outerWidth() + parseInt(element.css('padding-left')), 'width' : element.width() - mselect_button.outerWidth()});
		}
		
		ac_position = element.position();
		var temp_left = parseInt(ac_position.left) + parseInt(element.css('border-left-width')) + parseInt(element.css('margin-left')); 
		isNaN(temp_left)? temp_left = 0 : '';
		mselect_frame.css({'left' :  temp_left});
	},
	
	val : function() {
		var self = this,
			options = self.options,
			areacode;
		if(options.mobile) {
			areacode = self.element.prev().val();
		} else {
			areacode = self.element.next().children().eq(0).children().eq(0).text();
		}
		return areacode;
		
	},
	
	areaCodeList : {
		'zh-cn'	: '86,355,213,93,54,971,297,968,994,247,20,251,353,372,376,244,1264,1268,43,61,853,1246,675,1242,92,595,970,973,507,55,375,1441,359,1,229,32,354,591,1787,48,387,267,501,975,226,257,850,240,45,49,670,228,1767,1809,7,593,291,33,298,689,594,590,379,679,63,358,238,500,220,242,243,57,506,1473,299,995,53,590,1671,592,7,509,82,31,599,1721,382,504,686,253,996,224,245,1,233,241,855,420,263,237,974,1345,269,225,965,385,254,682,599,371,266,856,961,231,218,370,423,262,352,250,40,261,356,960,265,60,223,389,692,596,230,222,1,1684,1340,976,1664,880,51,691,95,373,212,377,258,52,264,27,211,674,977,505,227,234,683,47,6723,680,351,81,46,41,503,685,381,232,221,357,248,966,590,239,290,1869,1758,378,508,1784,94,421,386,268,249,597,252,677,992,886,66,255,676,1649,1868,216,688,90,993,690,681,678,502,58,673,256,380,598,998,34,30,852,65,687,64,36,963,1876,374,967,964,98,972,39,91,62,44,1284,246,962,84,260,235,350,56,236,86',
		'en-us'	: '1,93,355,213,1684,376,244,1264,1268,54,374,297,247,61,43,994,1242,973,880,1246,375,32,501,229,1441,975,591,387,267,55,246,1284,673,359,226,257,855,237,1,238,599,1345,236,235,56,86,57,269,243,242,682,506,225,385,53,599,357,420,45,253,1767,1809,593,20,503,240,291,372,251,500,298,679,358,33,594,689,241,220,995,49,233,350,30,299,1473,590,1671,502,224,245,592,509,504,852,36,354,91,62,98,964,353,972,39,1876,81,962,7,254,686,965,996,856,371,961,266,231,218,423,370,352,853,389,261,265,60,960,223,356,692,596,222,230,52,691,373,377,976,382,1664,212,258,95,264,674,977,31,687,64,505,227,234,683,6723,1,850,47,968,92,680,970,507,675,595,51,63,48,351,1787,974,262,40,7,250,590,290,1869,1758,590,508,1784,685,378,239,966,221,381,248,232,65,1721,421,386,677,252,27,82,211,34,94,249,597,268,46,41,963,886,992,255,66,670,228,690,676,1868,216,90,993,1649,688,1340,256,380,971,44,1,598,998,678,379,58,84,681,967,260,263',
		'zh-tw'	: '886,355,213,93,54,971,297,968,994,247,20,251,353,372,376,244,1264,1268,43,61,853,1246,675,1242,92,595,970,973,507,55,375,1441,359,1,229,32,354,591,1787,48,387,267,501,975,226,257,850,240,45,49,670,228,1767,1809,7,593,291,33,298,689,594,590,379,679,63,358,238,500,220,242,243,57,506,1473,299,995,53,590,1671,592,7,509,82,31,599,1721,382,504,686,253,996,224,245,1,233,241,855,420,263,237,974,1345,269,225,965,385,254,682,599,371,266,856,961,231,218,370,423,262,352,250,40,261,356,960,265,60,223,389,692,596,230,222,1,1684,1340,976,1664,880,51,691,95,373,212,377,258,52,264,27,211,674,977,505,227,234,683,47,6723,680,351,81,46,41,503,685,381,232,221,357,248,966,590,239,290,1869,1758,378,508,1784,94,421,386,268,249,597,252,677,992,886,66,255,676,1649,1868,216,688,90,993,690,681,678,502,58,673,256,380,598,998,34,30,852,65,687,64,36,963,1876,374,967,964,98,972,39,91,62,44,1284,246,962,84,260,235,350,56,236,86',
		'de-de'	: '49,93,20,355,213,1340,1684,376,244,1264,1268,240,54,374,297,247,994,251,61,1242,973,880,1246,375,32,501,229,1441,975,591,387,267,55,1284,246,673,359,226,257,56,86,682,506,225,599,45,850,49,1767,1809,253,593,503,291,372,500,298,679,358,33,594,689,241,220,995,233,350,1473,30,299,590,1671,502,224,245,592,509,504,852,91,62,964,98,353,354,972,39,1876,81,967,962,1345,855,237,1,238,599,7,974,254,996,686,57,269,242,243,385,53,965,856,266,371,961,231,218,423,370,352,853,261,265,60,960,223,356,212,692,596,222,230,389,52,691,377,976,382,1664,258,95,264,674,977,687,64,505,31,227,234,683,1,6723,47,968,43,670,92,970,680,507,675,595,51,63,48,351,1787,82,373,262,250,40,7,677,260,685,378,239,966,46,41,221,381,248,232,263,65,1721,421,386,252,34,94,590,290,1869,1758,590,508,1784,27,249,211,597,268,963,992,886,255,66,228,690,676,1868,235,420,216,90,993,1649,688,256,380,36,598,998,678,379,58,971,44,1,84,681,236,357',
		'fr-fr'	: '33,93,27,355,213,49,376,244,1264,1268,966,54,374,297,61,43,994,1242,973,880,1246,375,32,501,229,1441,975,591,387,267,55,673,359,226,257,855,237,1,238,56,86,357,57,269,242,850,82,506,225,385,53,599,45,253,1767,20,971,593,291,34,372,379,691,1,251,679,358,33,241,220,995,233,350,30,1473,299,590,1671,502,224,245,240,592,594,509,504,852,36,247,6723,1345,682,298,500,1,692,677,1649,1284,1340,91,62,964,98,353,354,972,39,1876,81,962,7,254,996,686,965,856,266,371,961,231,218,423,370,352,853,389,261,60,265,960,223,356,212,596,230,222,52,373,377,976,382,1664,258,95,264,674,977,505,227,234,683,47,687,64,968,256,998,92,680,507,675,595,31,599,51,63,48,689,1787,351,974,236,243,1809,420,262,40,44,7,250,590,290,1758,1869,378,590,1721,508,1784,503,685,1684,239,221,381,248,232,65,421,386,252,249,211,94,46,41,597,268,963,992,886,255,235,246,970,66,670,228,690,676,1868,216,993,90,688,380,598,678,58,84,681,967,260,263',
		'ja-jp'	: '81,354,353,994,247,93,1,971,213,54,297,355,374,1264,244,1268,376,967,44,972,39,964,98,91,62,681,256,380,998,598,593,20,372,251,291,503,61,43,968,31,599,238,592,7,974,1,241,237,220,855,233,224,245,357,53,599,30,686,996,502,590,1671,965,682,299,995,1473,385,1345,254,225,506,269,57,242,243,966,685,239,260,508,378,590,590,232,253,350,1876,963,65,1721,263,41,46,249,34,597,94,421,386,268,248,221,381,1869,1784,290,1758,252,677,1649,66,992,255,420,235,216,56,688,45,49,228,690,1809,1767,1868,993,90,676,234,674,264,683,505,227,687,64,977,6723,47,509,92,379,507,678,1242,675,1441,680,595,1246,970,36,880,973,679,63,358,1787,298,500,55,33,359,226,673,257,975,84,229,58,375,501,51,32,387,267,591,351,504,48,692,853,389,261,265,223,356,596,60,691,95,52,230,222,258,377,960,373,212,976,382,1664,962,856,371,370,218,423,231,40,352,250,266,961,262,7,246,1284,852,240,886,82,236,86,850,670,27,211,81,594,689,1340,1684,1',
		'ko-kr'	: '82,233,241,592,220,590,502,1671,1473,995,30,299,245,224,238,264,674,234,211,27,31,599,977,47,6723,64,687,683,227,505,886,82,45,1767,1809,49,670,856,231,371,7,961,266,40,352,250,218,262,370,423,261,692,853,389,265,60,223,596,52,377,212,230,222,258,382,1664,373,960,356,976,1,1340,95,691,678,973,1246,379,1242,880,1441,229,58,84,32,375,501,387,267,591,257,226,975,1,359,55,673,685,966,357,378,239,590,590,221,381,1758,1784,1869,508,290,252,677,249,597,248,94,268,46,41,34,421,386,963,232,1721,65,971,297,374,54,1684,354,509,353,994,93,1264,376,355,213,244,1268,247,291,372,593,503,44,1284,246,967,968,61,43,504,681,962,256,598,998,380,251,964,98,972,20,39,91,62,81,1876,260,240,850,86,236,253,350,263,235,420,56,237,7,974,855,1,254,1345,269,506,225,57,242,243,53,965,682,599,385,996,686,992,255,66,1649,90,228,690,676,993,688,216,1868,507,595,92,675,680,970,298,51,351,500,48,1787,33,594,689,679,358,63,36,852'
	},
	
	areaNameList : {
		'zh-cn'	: '中国,阿尔巴尼亚,阿尔及利亚,阿富汗,阿根廷,阿拉伯联合酋长国,阿鲁巴,阿曼,阿塞拜疆,阿森松岛,埃及,埃塞俄比亚,爱尔兰,爱沙尼亚,安道尔,安哥拉,安圭拉,安提瓜和巴布达,奥地利,澳大利亚,澳门,巴巴多斯,巴布亚新几内亚,巴哈马,巴基斯坦,巴拉圭,巴勒斯坦领土,巴林,巴拿马,巴西,白俄罗斯,百慕大,保加利亚,北马里亚纳群岛,贝宁,比利时,冰岛,玻利维亚,波多黎各,波兰,波斯尼亚和黑塞哥维那,博茨瓦纳,伯利兹,不丹,布基纳法索,布隆迪,朝鲜,赤道几内亚,丹麦,德国,东帝汶,多哥,多米尼加,多米尼加共和国,俄罗斯,厄瓜多尔,厄立特里亚,法国,法罗群岛,法属波利尼西亚,法属圭亚那,法属圣马丁,梵蒂冈,斐济,菲律宾,芬兰,佛得角,福克兰群岛,冈比亚,刚果（布）,刚果（金）,哥伦比亚,哥斯达黎加,格林纳达,格陵兰,格鲁吉亚,古巴,瓜德罗普岛,关岛,圭亚那,哈萨克斯坦,海地,韩国,荷兰,荷兰加勒比,荷属圣马丁,黑山共和国,洪都拉斯,基里巴斯,吉布提,吉尔吉斯斯坦,几内亚,几内亚比绍,加拿大,加纳,加蓬,柬埔寨,捷克共和国,津巴布韦,喀麦隆,卡塔尔,开曼群岛,科摩罗,科特迪瓦,科威特,克罗地亚,肯尼亚,库克群岛,库拉索,拉脱维亚,莱索托,老挝,黎巴嫩,利比里亚,利比亚,立陶宛,列支敦士登,留尼汪,卢森堡,卢旺达,罗马尼亚,马达加斯加,马耳他,马尔代夫,马拉维,马来西亚,马里,马其顿,马绍尔群岛,马提尼克,毛里求斯,毛里塔尼亚,美国,美属萨摩亚,美属维京群岛,蒙古,蒙塞拉特,孟加拉国,秘鲁,密克罗尼西亚联邦,缅甸,摩尔多瓦,摩洛哥,摩纳哥,莫桑比克,墨西哥,纳米比亚,南非,南苏丹,瑙鲁,尼泊尔,尼加拉瓜,尼日尔,尼日利亚,纽埃,挪威,诺福克岛,帕劳,葡萄牙,日本,瑞典,瑞士,萨尔瓦多,萨摩亚,塞尔维亚,塞拉利昂,塞内加尔,塞浦路斯,塞舌尔,沙特阿拉伯,圣巴泰勒米,圣多美和普林西比,圣赫勒拿,圣基茨和尼维斯,圣卢西亚,圣马力诺,圣皮埃尔和密克隆群岛,圣文森特和格林纳丁斯,斯里兰卡,斯洛伐克,斯洛文尼亚,斯威士兰,苏丹,苏里南,索马里,所罗门群岛,塔吉克斯坦,台湾,泰国,坦桑尼亚,汤加,特克斯和凯科斯群岛,特立尼达和多巴哥,突尼西亞,图瓦卢,土耳其,土库曼斯坦,托克劳,瓦利斯和富图纳,瓦努阿图,危地马拉,委内瑞拉,文莱,乌干达,乌克兰,乌拉圭,乌兹别克斯坦,西班牙,希腊,香港,新加坡,新喀里多尼亚,新西兰,匈牙利,叙利亚,牙买加,亚美尼亚,也门,伊拉克,伊朗,以色列,意大利,印度,印度尼西亚,英国,英属维京群岛,英属印度洋领地,约旦,越南,赞比亚,乍得,直布罗陀,智利,中非共和国,中国',
		'en-us'	: 'United States,Afghanistan,Albania,Algeria,American Samoa,Andorra,Angola,Anguilla,Antigua and Barbuda,Argentina,Armenia,Aruba,Ascension Island,Australia,Austria,Azerbaijan,Bahamas,Bahrain,Bangladesh,Barbados,Belarus,Belgium,Belize,Benin,Bermuda,Bhutan,Bolivia,Bosnia and Herzegovina,Botswana,Brazil,British Indian Ocean Territory,British Virgin Islands,Brunei,Bulgaria,Burkina Faso,Burundi,Cambodia,Cameroon,Canada,Cape Verde,Caribbean Netherlands,Cayman Islands,Central African Republic,Chad,Chile,China,Colombia,Comoros,Congo [DRC],Congo [Republic],Cook Islands,Costa Rica,Côte d\'Ivoire,Croatia,Cuba,Curaçao,Cyprus,Czech Republic,Denmark,Djibouti,Dominica,Dominican Republic,Ecuador,Egypt,El Salvador,Equatorial Guinea,Eritrea,Estonia,Ethiopia,Falkland Islands [Islas Malvinas],Faroe Islands,Fiji,Finland,France,French Guiana,French Polynesia,Gabon,Gambia,Georgia,Germany,Ghana,Gibraltar,Greece,Greenland,Grenada,Guadeloupe,Guam,Guatemala,Guinea,Guinea-Bissau,Guyana,Haiti,Honduras,Hong Kong,Hungary,Iceland,India,Indonesia,Iran,Iraq,Ireland,Israel,Italy,Jamaica,Japan,Jordan,Kazakhstan,Kenya,Kiribati,Kuwait,Kyrgyzstan,Laos,Latvia,Lebanon,Lesotho,Liberia,Libya,Liechtenstein,Lithuania,Luxembourg,Macau,Macedonia [FYROM],Madagascar,Malawi,Malaysia,Maldives,Mali,Malta,Marshall Islands,Martinique,Mauritania,Mauritius,Mexico,Micronesia,Moldova,Monaco,Mongolia,Montenegro,Montserrat,Morocco,Mozambique,Myanmar [Burma],Namibia,Nauru,Nepal,Netherlands,New Caledonia,New Zealand,Nicaragua,Niger,Nigeria,Niue,Norfolk Island,Northern Mariana Islands,North Korea,Norway,Oman,Pakistan,Palau,Palestinian Territories,Panama,Papua New Guinea,Paraguay,Peru,Philippines,Poland,Portugal,Puerto Rico,Qatar,Réunion,Romania,Russia,Rwanda,Saint Barthélemy,Saint Helena,Saint Kitts and Nevis,Saint Lucia,Saint Martin,Saint Pierre and Miquelon,Saint Vincent and the Grenadines,Samoa,San Marino,São Tomé and Príncipe,Saudi Arabia,Senegal,Serbia,Seychelles,Sierra Leone,Singapore,Sint Maarten,Slovakia,Slovenia,Solomon Islands,Somalia,South Africa,South Korea,South Sudan,Spain,Sri Lanka,Sudan,Suriname,Swaziland,Sweden,Switzerland,Syria,Taiwan,Tajikistan,Tanzania,Thailand,Timor-Leste,Togo,Tokelau,Tonga,Trinidad and Tobago,Tunisia,Turkey,Turkmenistan,Turks and Caicos Islands,Tuvalu,U.S. Virgin Islands,Uganda,Ukraine,United Arab Emirates,United Kingdom,United States,Uruguay,Uzbekistan,Vanuatu,Vatican City,Venezuela,Vietnam,Wallis and Futuna,Yemen,Zambia,Zimbabwe',
		'zh-tw'	: '台灣,阿爾巴尼亞,阿爾及利亞,阿富汗,阿根廷,阿拉伯聯合酋長國,阿魯巴,阿曼,阿塞拜疆,阿森松島,埃及,埃塞俄比亞,愛爾蘭,愛沙尼亞,安道爾,安哥拉,安圭拉,安提瓜和巴布達,奧地利,澳大利亞,澳門,巴巴多斯,巴布亞新幾內亞,巴哈馬,巴基斯坦,巴拉圭,巴勒斯坦領土,巴林,巴拿馬,巴西,白俄羅斯,百慕大,保加利亞,北馬里亞納群島,貝寧,比利時,冰島,玻利維亞,波多黎各,波蘭,波斯尼亞和黑塞哥維那,博茨瓦納,伯利茲,不丹,布基納法索,布隆迪,朝鮮,赤道幾內亞,丹麥,德國,東帝汶,多哥,多米尼加,多米尼加共和國,俄羅斯,厄瓜多爾,厄立特里亞,法國,法羅群島,法屬波利尼西亞,法屬圭亞那,法屬聖馬丁,梵蒂岡,斐濟,菲律賓,芬蘭,佛得角,福克蘭群島,岡比亞,剛果（布）,剛果（金）,哥倫比亞,哥斯達黎加,格林納達,格陵蘭,格魯吉亞,古巴,瓜德羅普島,關島,圭亞那,哈薩克斯坦,海地,韓國,荷蘭,荷蘭加勒比,荷屬聖馬丁,黑山共和國,洪都拉斯,基里巴斯,吉布提,吉爾吉斯斯坦,幾內亞,幾內亞比紹,加拿大,加納,加蓬,柬埔寨,捷克共和國,津巴布韋,喀麥隆,卡塔爾,開曼群島,科摩羅,科特迪瓦,科威特,克羅地亞,肯尼亞,庫克群島,庫拉索,拉脫維亞,萊索托,老撾,黎巴嫩,利比里亞,利比亞,立陶宛,列支敦士登,留尼汪,盧森堡,盧旺達,羅馬尼亞,馬達加斯加,馬耳他,馬爾代夫,馬拉維,馬來西亞,馬里,馬其頓,馬紹爾群島,馬提尼克,毛里求斯,毛里塔尼亞,美國,美屬薩摩亞,美屬維京群島,蒙古,蒙塞拉特,孟加拉國,秘魯,密克羅尼西亞聯邦,緬甸,摩爾多瓦,摩洛哥,摩納哥,莫桑比克,墨西哥,納米比亞,南非,南蘇丹,瑙魯,尼泊爾,尼加拉瓜,尼日爾,尼日利亞,紐埃,挪威,諾福克島,帕勞,葡萄牙,日本,瑞典,瑞士,薩爾瓦多,薩摩亞,塞爾維亞,塞拉利昂,塞內加爾,塞浦路斯,塞舌爾,沙特阿拉伯,聖巴泰勒米,聖多美和普林西比,聖赫勒拿,聖基茨和尼維斯,聖盧西亞,聖馬力諾,聖皮埃爾和密克隆群島,聖文森特和格林納丁斯,斯里蘭卡,斯洛伐克,斯洛文尼亞,斯威士蘭,蘇丹,蘇里南,索馬里,所羅門群島,塔吉克斯坦,台灣,泰國,坦桑尼亞,湯加,特克斯和凱科斯群島,特立尼達和多巴哥,突尼西亞,圖瓦盧,土耳其,土庫曼斯坦,托克勞,瓦利斯和富圖納,瓦努阿圖,危地馬拉,委內瑞拉,文萊,烏干達,烏克蘭,烏拉圭,烏茲別克斯坦,西班牙,希臘,香港,新加坡,新喀裡多尼亞,新西蘭,匈牙利,敘利亞,牙買加,亞美尼亞,也門,伊拉克,伊朗,以色列,意大利,印度,印度尼西亞,英國,英屬維京群島,英屬印度洋領地,約旦,越南,贊比亞,乍得,直布羅陀,智利,中非共和國,中國',
		'de-de'	: 'Deutschland,Afghanistan,Ägypten,Albanien,Algerien,Amerikanische Jungferninseln,Amerikanisch-Samoa,Andorra,Angola,Anguilla,Antigua und Barbuda,Äquatorialguinea,Argentinien,Armenien,Aruba,Ascension,Aserbaidschan,Äthiopien,Australien,Bahamas,Bahrain,Bangladesch,Barbados,Belarus,Belgien,Belize,Benin,Bermuda,Bhutan,Bolivien,Bosnien und Herzegowina,Botsuana,Brasilien,Britische Jungferninseln,Britisches Territorium im Indischen Ozean,Brunei Darussalam,Bulgarien,Burkina Faso,Burundi,Chile,China,Cookinseln,Costa Rica,Côte d\'Ivoire,Curaçao,Dänemark,Demokratische Volksrepublik Korea,Deutschland,Dominica,Dominikanische Republik,Dschibuti,Ecuador,El Salvador,Eritrea,Estland,Falklandinseln,Färöer,Fidschi,Finnland,Frankreich,Französisch-Guayana,Französisch-Polynesien,Gabun,Gambia,Georgien,Ghana,Gibraltar,Grenada,Griechenland,Grönland,Guadeloupe,Guam,Guatemala,Guinea,Guinea-Bissau,Guyana,Haiti,Honduras,Hongkong,Indien,Indonesien,Irak,Iran,Irland,Island,Israel,Italien,Jamaika,Japan,Jemen,Jordanien,Kaimaninseln,Kambodscha,Kamerun,Kanada,Kap Verde,Karibische Niederlande,Kasachstan,Katar,Kenia,Kirgisistan,Kiribati,Kolumbien,Komoren,Kongo-Brazzaville,Kongo-Kinshasa,Kroatien,Kuba,Kuwait,Laos,Lesotho,Lettland,Libanon,Liberia,Libyen,Liechtenstein,Litauen,Luxemburg,Macao,Madagaskar,Malawi,Malaysia,Malediven,Mali,Malta,Marokko,Marshallinseln,Martinique,Mauretanien,Mauritius,Mazedonien,Mexiko,Mikronesien,Monaco,Mongolei,Montenegro,Montserrat,Mosambik,Myanmar,Namibia,Nauru,Nepal,Neukaledonien,Neuseeland,Nicaragua,Niederlande,Niger,Nigeria,Niue,Nördliche Marianen,Norfolkinsel,Norwegen,Oman,Österreich,Osttimor,Pakistan,Palästinensische Autonomiegebiete,Palau,Panama,Papua-Neuguinea,Paraguay,Peru,Philippinen,Polen,Portugal,Puerto Rico,Republik Korea,Republik Moldau,Réunion,Ruanda,Rumänien,Russische Föderation,Salomonen,Sambia,Samoa,San Marino,São Tomé und Príncipe,Saudi-Arabien,Schweden,Schweiz,Senegal,Serbien,Seychellen,Sierra Leone,Simbabwe,Singapur,Sint Maarten,Slowakei,Slowenien,Somalia,Spanien,Sri Lanka,St. Barthélemy,St. Helena,St. Kitts und Nevis,St. Lucia,St. Martin,St. Pierre und Miquelon,St. Vincent und die Grenadinen,Südafrika,Sudan,Südsudan,Suriname,Swasiland,Syrien,Tadschikistan,Taiwan,Tansania,Thailand,Togo,Tokelau,Tonga,Trinidad und Tobago,Tschad,Tschechische Republik,Tunesien,Türkei,Turkmenistan,Turks- und Caicosinseln,Tuvalu,Uganda,Ukraine,Ungarn,Uruguay,Usbekistan,Vanuatu,Vatikanstadt,Venezuela,Vereinigte Arabische Emirate,Vereinigtes Königreich,Vereinigte Staaten,Vietnam,Wallis und Futuna,Zentralafrikanische Republik,Zypern',
		'fr-fr'	: 'France,Afghanistan,Afrique du Sud,Albanie,Algérie,Allemagne,Andorre,Angola,Anguilla,Antigua-et-Barbuda,Arabie saoudite,Argentine,Arménie,Aruba,Australie,Autriche,Azerbaïdjan,Bahamas,Bahreïn,Bangladesh,Barbade,Bélarus,Belgique,Belize,Bénin,Bermudes,Bhoutan,Bolivie,Bosnie-Herzégovine,Botswana,Brésil,Brunéi Darussalam,Bulgarie,Burkina Faso,Burundi,Cambodge,Cameroun,Canada,Cap-Vert,Chili,Chine,Chypre,Colombie,Comores,Congo-Brazzaville,Corée du Nord,Corée du Sud,Costa Rica,Côte d\'Ivoire,Croatie,Cuba,Curaçao,Danemark,Djibouti,Dominique,Égypte,Émirats arabes unis,Équateur,Érythrée,Espagne,Estonie,État de la Cité du Vatican,États fédérés de Micronésie,États-Unis,Éthiopie,Fidji,Finlande,France,Gabon,Gambie,Géorgie,Ghana,Gibraltar,Grèce,Grenade,Groenland,Guadeloupe,Guam,Guatemala,Guinée,Guinée-Bissau,Guinée équatoriale,Guyana,Guyane française,Haïti,Honduras,Hong Kong,Hongrie,Île de l\'Ascension,Île Norfolk,Îles Caïmans,Îles Cook,Îles Féroé,Îles Malouines,Îles Mariannes du Nord,Îles Marshall,Îles Salomon,Îles Turks et Caïques,Îles Vierges britanniques,Îles Vierges des États-Unis,Inde,Indonésie,Irak,Iran,Irlande,Islande,Israël,Italie,Jamaïque,Japon,Jordanie,Kazakhstan,Kenya,Kirghizistan,Kiribati,Koweït,Laos,Lesotho,Lettonie,Liban,Libéria,Libye,Liechtenstein,Lituanie,Luxembourg,Macao,Macédoine,Madagascar,Malaisie,Malawi,Maldives,Mali,Malte,Maroc,Martinique,Maurice,Mauritanie,Mexique,Moldavie,Monaco,Mongolie,Monténégro,Montserrat,Mozambique,Myanmar,Namibie,Nauru,Népal,Nicaragua,Niger,Nigéria,Niue,Norvège,Nouvelle-Calédonie,Nouvelle-Zélande,Oman,Ouganda,Ouzbékistan,Pakistan,Palaos,Panama,Papouasie-Nouvelle-Guinée,Paraguay,Pays-Bas,Pays-Bas caribéens,Pérou,Philippines,Pologne,Polynésie française,Porto Rico,Portugal,Qatar,République centrafricaine,République démocratique du Congo,République dominicaine,République tchèque,Réunion,Roumanie,Royaume-Uni,Russie,Rwanda,Saint-Barthélémy,Sainte-Hélène,Sainte-Lucie,Saint-Kitts-et-Nevis,Saint-Marin,Saint-Martin [partie française],Saint-Martin [partie néerlandaise],Saint-Pierre-et-Miquelon,Saint-Vincent-et-les Grenadines,Salvador,Samoa,Samoa américaines,Sao Tomé-et-Príncipe,Sénégal,Serbie,Seychelles,Sierra Leone,Singapour,Slovaquie,Slovénie,Somalie,Soudan,Soudan du Sud,Sri Lanka,Suède,Suisse,Suriname,Swaziland,Syrie,Tadjikistan,Taïwan,Tanzanie,Tchad,Territoire britannique de l\'océan Indien,Territoire palestinien,Thaïlande,Timor oriental,Togo,Tokelau,Tonga,Trinité-et-Tobago,Tunisie,Turkménistan,Turquie,Tuvalu,Ukraine,Uruguay,Vanuatu,Venezuela,Viêt Nam,Wallis-et-Futuna,Yémen,Zambie,Zimbabwe',
		'ja-jp'	: '日本,アイスランド,アイルランド,アゼルバイジャン,アセンション島,アフガニスタン,アメリカ,アラブ首長国連邦,アルジェリア,アルゼンチン,アルバ,アルバニア,アルメニア,アンギラ,アンゴラ,アンティグア・バーブーダ,アンドラ,イエメン,イギリス,イスラエル,イタリア,イラク,イラン,インド,インドネシア,ウォリス・フツナ,ウガンダ,ウクライナ,ウズベキスタン,ウルグアイ,エクアドル,エジプト,エストニア,エチオピア,エリトリア,エルサルバドル,オーストラリア,オーストリア,オマーン,オランダ,オランダ領カリブ,カーボベルデ,ガイアナ,カザフスタン,カタール,カナダ,ガボン,カメルーン,ガンビア,カンボジア,ガーナ,ギニア,ギニアビサウ,キプロス,キューバ,キュラソー,ギリシャ,キリバス,キルギス,グアテマラ,グアドループ,グアム,クウェート,クック諸島,グリーンランド,グルジア,グレナダ,クロアチア,ケイマン諸島,ケニア,コートジボワール,コスタリカ,コモロ,コロンビア,コンゴ共和国[ブラザビル],コンゴ民主共和国[キンシャサ],サウジアラビア,サモア,サントメ・プリンシペ,ザンビア,サンピエール島・ミクロン島,サンマリノ,サン・バルテルミー島,サン・マルタン,シエラレオネ,ジブチ,ジブラルタル,ジャマイカ,シリア,シンガポール,シント・マールテン,ジンバブエ,スイス,スウェーデン,スーダン,スペイン,スリナム,スリランカ,スロバキア,スロベニア,スワジランド,セーシェル,セネガル,セルビア,セントクリストファー・ネイビス,セントビンセント・グレナディーン諸島,セントヘレナ,セントルシア,ソマリア,ソロモン諸島,タークス・カイコス諸島,タイ,タジキスタン,タンザニア,チェコ共和国,チャド,チュニジア,チリ,ツバル,デンマーク,ドイツ,トーゴ,トケラウ,ドミニカ共和国,ドミニカ国,トリニダード・トバゴ,トルクメニスタン,トルコ,トンガ,ナイジェリア,ナウル,ナミビア,ニウエ島,ニカラグア,ニジェール,ニューカレドニア,ニュージーランド,ネパール,ノーフォーク島,ノルウェー,ハイチ,パキスタン,バチカン市国,パナマ,バヌアツ,バハマ,パプアニューギニア,バミューダ,パラオ,パラグアイ,バルバドス,パレスチナ,ハンガリー,バングラデシュ,バーレーン,フィジー,フィリピン,フィンランド,プエルトリコ,フェロー諸島,フォークランド諸島,ブラジル,フランス,ブルガリア,ブルキナファソ,ブルネイ,ブルンジ,ブータン,ベトナム,ベナン,ベネズエラ,ベラルーシ,ベリーズ,ペルー,ベルギー,ボスニア・ヘルツェゴビナ,ボツワナ,ボリビア,ポルトガル,ホンジュラス,ポーランド,マーシャル諸島,マカオ,マケドニア,マダガスカル,マラウイ,マリ,マルタ,マルティニーク,マレーシア,ミクロネシア連邦,ミャンマー,メキシコ,モーリシャス,モーリタニア,モザンビーク,モナコ,モルジブ,モルドバ,モロッコ,モンゴル,モンテネグロ,モントセラト,ヨルダン,ラオス,ラトビア,リトアニア,リビア,リヒテンシュタイン,リベリア,ルーマニア,ルクセンブルグ,ルワンダ,レソト,レバノン,レユニオン島,ロシア,英領インド洋地域,英領ヴァージン諸島,香港,赤道ギニア,台湾,大韓民国,中央アフリカ共和国,中国,朝鮮民主主義人民共和国,東ティモール,南アフリカ,南スーダン,日本,仏領ギアナ,仏領ポリネシア,米領ヴァージン諸島,米領サモア,北マリアナ諸島',
		'ko-kr'	: '대한민국,가나,가봉,가이아나,감비아,과들루프,과테말라,괌,그레나다,그루지야,그리스,그린란드,기네비쏘,기니,까뽀베르데,나미비아,나우루,나이지리아,남수단,남아프리카,네덜란드,네덜란드령 카리브,네팔,노르웨이,노퍽섬,뉴질랜드,뉴 칼레도니아,니우에,니제르,니카라과,대만,대한민국,덴마크,도미니카,도미니카 공화국,독일,동티모르,라오스,라이베리아,라트비아,러시아,레바논,레소토,루마니아,룩셈부르크,르완다,리비아,리유니온,리투아니아,리히텐슈타인,마다가스카르,마샬 군도,마카오,마케도니아,말라위,말레이시아,말리,말티니크,멕시코,모나코,모로코,모리셔스,모리타니,모잠비크,몬테네그로,몬트세라트,몰도바,몰디브,몰타,몽골,미국,미국령 버진 아일랜드,미얀마,미크로네시아,바누아투,바레인,바베이도스,바티칸,바하마,방글라데시,버뮤다,베냉,베네수엘라,베트남,벨기에,벨라루스,벨리즈,보스니아 헤르체고비나,보츠와나,볼리비아,부룬디,부르키나파소,부탄,북마리아나제도,불가리아,브라질,브루나이,사모아,사우디아라비아,사이프러스,산마리노,상투메 프린시페,생 마르탱,생 바르텔르미,세네갈,세르비아,세인트루시아,세인트빈센트그레나딘,세인트크리스토퍼 네비스,세인트피에르-미케롱,세인트헬레나,소말리아,솔로몬 제도,수단,수리남,쉐이쉘,스리랑카,스와질랜드,스웨덴,스위스,스페인,슬로바키아,슬로베니아,시리아,시에라리온,신트마르턴,싱가포르,아랍에미리트 연합,아루바,아르메니아,아르헨티나,아메리칸 사모아,아이슬란드,아이티,아일랜드,아제르바이잔,아프가니스탄,안길라,안도라,알바니아,알제리,앙골라,앤티가 바부다,어센션 섬,에리트리아,에스토니아,에콰도르,엘살바도르,영국,영국령 버진 아일랜드,영국령인도양식민지,예멘,오만,오스트레일리아,오스트리아,온두라스,왈리스-푸투나 제도,요르단,우간다,우루과이,우즈베키스탄,우크라이나,이디오피아,이라크,이란,이스라엘,이집트,이탈리아,인도,인도네시아,일본,자메이카,잠비아,적도 기니,조선 민주주의 인민 공화국,중국,중앙 아프리카 공화국,지부티,지브롤터,짐바브웨,차드,체코,칠레,카메룬,카자흐스탄,카타르,캄보디아,캐나다,케냐,케이맨제도,코모로스,코스타리카,코트디부아르,콜롬비아,콩고,콩고-킨샤사,쿠바,쿠웨이트,쿡제도,퀴라소,크로아티아,키르기스스탄,키리바시,타지키스탄,탄자니아,태국,터크스케이커스제도,터키,토고,토켈라우,통가,투르크메니스탄,투발루,튀니지,트리니다드 토바고,파나마,파라과이,파키스탄,파푸아뉴기니,팔라우,팔레스타인 지구,페로제도,페루,포르투갈,포클랜드 제도,폴란드,푸에르토리코,프랑스,프랑스령 기아나,프랑스령 폴리네시아,피지,핀란드,필리핀,헝가리,홍콩'
	},
	
	options : {
		mobile : 0,
		langid : 'zh-cn',
		type : 'single_out',
		adapt : 0, 
		contents : []
	}
	
});