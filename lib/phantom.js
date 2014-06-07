var childProcess = require("child_process");

var kew = require("kew");
var phantomjs = require("phantomjs");

exports.do = function (pathToHtml, functionName) { // we can pass additional parameters, that will be passed to functionName as strings
	var deferred = kew.defer();

	var processArgs = [
		__dirname + "/phantom/loader.js",
		pathToHtml,
		functionName
	].concat(Array.prototype.slice.call(arguments, 2));

	childProcess.execFile(phantomjs.path, processArgs, function (error, stdout, stderr) {
		deferred.resolve(stdout);
	});

	return deferred;
}
