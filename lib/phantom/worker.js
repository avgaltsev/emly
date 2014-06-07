/**
 * Do not use closures to global space here.
 * Exported functions will be evaluated in isolated context.
 */

exports.cripple = function () {
	function toObject(css) {
		var result = {};

		if (css) {
			if (css instanceof CSSStyleDeclaration) {
				_(css).forEach(function (rule) {
					result[rule] = css[rule];
				});
			} else if (typeof css === "string") {
				css.split("; ").forEach(function (rule) {
					rule = rule.split(": ");
					result[rule[0]] = rule[1];
				});
			}
		}

		return result;
	}

	function getMatchedRules($element) {
		var result = {};

		var styleSheets = document.styleSheets;

		_(styleSheets).forEach(function (styleSheet) {
			var rules = styleSheet.rules || styleSheet.cssRules;

			_(rules).forEach(function (rule) {
				if ($element.is(rule.selectorText)) {
					result = $.extend(result, toObject(rule.style), toObject($element.attr("style")));
				}
			});
		});

		return result;
	}

	$("script", "body").remove();

	$("body").add($("*", "body")).each(function (index, element) {
		var $element = $(element);
		$element.css(getMatchedRules($element));
	}).removeAttr("class");

	return $("<div>").append($("body").clone()).html();
};

exports.textify = function () {
	$("script", "body").remove();

	var result = [];

	$("*", "body").contents().filter(function () {
		return this.nodeType === 3;
	}).each(function (index, element) {
		result.push(element.data);
	});

	return result.join("\n\n");
};
