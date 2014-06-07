var fs = require("fs");

var kew = require("kew");

var phantom = require("./phantom");
var email = require("./email");

function getText(cwd, json) {
	if (json.text) {
		var deferred = kew.defer();

		fs.readFile(cwd + json.text, {encoding: "utf8"}, function (error, data) {
			if (error) {
				deferred.reject(error);
			} else {
				deferred.resolve(data);
			}
		});

		return deferred;
	} else {
		return phantom.do(cwd + json.html, "textify");
	}
	return kew.resolve("text");
}

function getHtml(cwd, json) {
	return phantom.do(cwd + json.html, "cripple");
}

function getImages(cwd, json) {
	return kew.resolve();
}

function getResult(cwd, json) {
	return kew.all(
		getText(cwd, json),
		getHtml(cwd, json),
		getImages(cwd, json)
	).then(function (results) {
		return email.build({
			headers: json.headers ? json.headers : {},
			preamble: json.preamble,
			epilogue: json.epilogue,
			content: [
				{
					headers: {
						"Content-Type": "text/plain; charset=UTF-8; format=flowed",
						"Content-Transfer-Encoding": "8bit"
					},
					content: results[0]
				},
				{
					headers: {
						"Content-Type": "text/html; charset=UTF-8",
						"Content-Transfer-Encoding": "8bit"
					},
					content: results[1]
				}
			]
		});
	})//.fail(function (message) {
	//	console.log(message);
	//});
}

exports.convert = function (pathToJson, output) {
	var cwd = process.cwd() + "/",
		json = JSON.parse(fs.readFileSync(cwd + pathToJson));

	getResult(cwd, json).then(function (result) {
		if (typeof output === "function") {
			output(result);
		} else if (typeof output === "string") {
			var outputStream = fs.createWriteStream(output, {
				flags: "w",
				encoding: "utf8",
				mode: 0644
			});

			outputStream.on("error", function(e) {
				console.log(e);
			});

			outputStream.write(result);

			outputStream.end();
		} else {
			process.stdout.write(result);
		}
	});
};
