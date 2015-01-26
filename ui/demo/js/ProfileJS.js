/**
 * JS 性能测试
 * */
var ProfileJS = {};

(function() {
	var po = ProfileJS,
		log = function(a) {return console.log(a)},
		isFn = function(a) {return typeof a == 'function'},
		isArr = function(a) {return a instanceof Array},
		isBool = function(a) {return typeof a == 'boolean'};
		
	var Arr = {
		average : function(arr) {
			var sum = Arr.sum(arr);
			return sum ? sum / arr.length : sum;
		},
		max : function(arr) {
			var max = false, i, length;
			
			if (isArr(arr) && arr.length) {
				max = arr[0];
				for (i = 1, length = arr.length; i < length; i++) {
					arr[i] > max ? max = arr[i] : 0;
				}
			}
			
			return max;
		},
		min : function(arr) {
			var min = false, i, length;
			
			if (isArr(arr) && arr.length) {
				min = arr[0];
				for (i = 1, length = arr.length; i < length; i++) {
					arr[i] < min ? min = arr[i] : 0;
				}
			}
			
			return min;
		},
		sum : function(arr) {
			var sum = 0, i, length;
			
			if (isArr(arr) && arr.length) {
				for (i = 0, length = arr.length; i < length; i++) {
					arr[i] ? sum = sum + arr[i] : '';
				}
			}
			
			return sum;
		}
	};
	
	/**
	 * 性能测试工具
	 * @param numbers 格式 [100, 1000, 10000]
	 * @details 默认返回 [平均值, 最小值, 最大值, 总时间, 执行次数]; 如果 all 为真, 则返回耗时明细 
	 * */
	function run(fn, numbers, details) {
		var records = {}, record, i, j, length, number, timer;

		timer = Timer();
		for (i = 0, length = numbers.length; i < length; i++) {
			record = records[i] = [];
			
			for (j = 0, number = numbers[i]; j < number; j++) {
				timer.start();
				fn();
				record.push(timer.end());
			}
			
			details ? 0 : records[i] = [Arr.average(record), Arr.min(record), Arr.max(record), Arr.sum(record), number];
		}
		
		return records;
	}
	
	/**
	 * @param number 运行次数, 默认 [100, 1000, 10000]
	 * @param toConsole 输出到控制台, 默认 true, 如果不输出到控制台, 则显示在页面右上角
	 * */
	po.test = function(fn, numbers, toConsole) {
		if (!isFn(fn)) {
			return false;
		}
		
		var args = arguments, records, record, i, length = args.length,
			doc, id, show, html_str;
		
		if (1 == length) {
			numbers = [100, 1000, 10000];
			toConsole = true;
		} else if (2 == length) {
			if (!isArr(numbers)) {
				toConsole  = numbers == null ? true : numbers;
				numbers = [100, 1000, 10000];
			}
		}
		
		records = run(fn, numbers);
		length = numbers.length;
		// 展示运行时间
		if (toConsole) {
			log(['Average', 'Min', 'Max', 'Sum', 'Numbers']);
			for (i = 0; i < length; i++) {
				log(records[i]);
			}
		} else {
			doc = document;
			id = 'profile_js_log';
			show = doc.getElementById(id);
			if (!show) {
				show = doc.createElement('div');
				show.id = id;
				doc.body.appendChild(show);
				show.style.cssText = 'position:fixed;top:0;right:0;padding:0 10px;background-color:green;color:white;font-size:14px';
				show.ondblclick = function() {
					doc.body.removeChild(show);
				};
			}
			
			html_str = '<table rules=all cellpadding=4 border=1 summary="ProfileJS test result" style="margin:10px 0">\
				<tr title="double click to close"><td>Average</td><td>Min</td><td>Max</td><td>Sum</td><td>Numbers</td></tr>';
			
			for (i = 0; i < length; i++) {
				record = records[i];
				html_str += '<tr><td>' + record[0] + '</td><td>' + record[1] + '</td><td>' + record[2] + '</td><td>' + record[3] + '</td><td>' + record[4] + '</td>';
			}
			
			html_str += '</table>';
			
			show.innerHTML += html_str;
		}
		
		return records;
	}
})();

/**
 * 计时器
 * */
function Timer() {
	var start = (new Date).getTime(), end = 0;
	
	return {
		start : function() {
			start = (new Date).getTime();
			end = 0;
		},
		end : function() {
			end = (new Date).getTime();
			return end - start;
		},
		differ : function() {
			return (end || (new Date).getTime()) - start;
		}
	};
}