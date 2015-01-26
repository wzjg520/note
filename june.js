;(function() {
	var iu = function (name) {
		if (widgets[name]) {
			var args = makeArray(arguments);args.shift();
			return iu[name].apply(iu.args);
		}
	}
}
	
)()