var system = require("system"),
	webpage = require("webpage"),
	fs = require("fs");

var worker = require("./worker");

var pathToHtml = system.args[1],
	functionName = system.args[2],
	args = system.args.slice(3);

var page = webpage.create();

function loadScripts(scripts, callback) {
	if (scripts.length) {
		page.includeJs(scripts.shift(), function () {
			loadScripts(scripts.slice(0), callback);
		});
	} else {
		callback();
	}
}

page.onError = function (message, trace) {
	console.log(message);
	phantom.exit();
}

page.open("file://" + pathToHtml, function (status) {
	var result = loadScripts([
		"http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js",
		"http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js"
	], function () {
		if (worker[functionName]) {
			fs.write("/dev/stdout", page.evaluate.apply(page, [worker[functionName]].concat(args)), "w");
		}
		phantom.exit();
	});
});
