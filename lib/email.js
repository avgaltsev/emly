var crlf = "\r\n";

function buildPart(content) {
	var result = "";

	var headers = content.headers || {};

	if (content.content instanceof Array) {
		var boundary = ("" + Math.random()).slice(2);
		headers["Content-Type"] = "multipart/alternative; boundary=" + boundary;
	}

	for (var a in headers) {
		result += a + ": " + headers[a] + crlf;
	}

	result += crlf;

	if (boundary) {
		result += (content.preamble ? content.preamble : "") + crlf;
		content.content.forEach(function (content) {
			result += "--" + boundary + crlf;
			result += buildPart(content) + crlf;
		});
		result += "--" + boundary + "--" + crlf;
		result += (content.epilogue ? content.epilogue : "") + crlf;
	} else {
		result += content.content + crlf;
	}

	return result;
}

exports.build = function (content) {
	return buildPart(content);
}
