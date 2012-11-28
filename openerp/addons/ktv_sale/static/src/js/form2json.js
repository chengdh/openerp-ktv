/*******************************************************************************
 *
 * @(#)Form2JSON.js
 *
 * JQuery $("formid").form2json()
 *
 * @author Poison
 * @version 1.1, 2012/04/09
 * @website www.iznd.com
 *
 * Use the example of the array:
 *
 * 	<form id="fm">
 * 		<input name="school.class[].userid" type="text" value="1" />
 * 		<input name="school.class[].userid" type="text" value="2" />
 * 	</form>
 *
 * 	var x = $("#fm").form2json();
 *
 * 	alert(x);
 *
 * 	@returns
 *
 *  {"school",{"class",[{"userid","1"},{"userid","2"}]}}
 *
 *
 ******************************************************************************/

function ifArr(m) {

	return Object.prototype.toString.apply(m) === '[object Array]';
}

function paramString2obj(serializedParams) {

	var obj = {};

	function evalThem(str) {
		var attributeName = str.split("=")[0];
		var attributeValue = str.split("=")[1];
		if (!attributeValue) {
			return;
		}

		array = attributeName.split(".");
		for (var i = 1; i < array.length; i++) {
			var tmpArray = Array();
			tmpArray.push("obj");
			for (var j = 0; j < i; j++) {
				tmpArray.push(array[j]);
			}
			var evalString = tmpArray.join(".");
			var m = evalString.replace(/%5B.*%5D/g, "");
			if (m == evalString && ! eval(m)) {
				eval(evalString + "={};");
			} else if (m != evalString && ! eval(m)) {
				eval(m + "=[];");
			}
		}
		var x = "obj." + attributeName;
		var tmpArray = x.split(/%5B.*%5D./);
		if (2 == tmpArray.length) {
			x = tmpArray[0] + ".push({\"" + tmpArray[1] + "\":\"" + attributeValue + "\"});";
		} else if (1 == tmpArray.length) {
			x = "obj." + attributeName + "='" + attributeValue + "';"
            //判断attributeName中是否有id,有的话转换为int
            if(attributeName.indexOf("_id") > 0)
                x = "obj." + attributeName + "=" + attributeValue + ";"

		} else {
			alert("Form2JSON Error!");
			return;
		}
		eval(x);
	}

	var properties = serializedParams.split("&");
	for (var i = 0; i < properties.length; i++) {
		evalThem(properties[i]);
	}
	return obj;
}

$.fn.form2json = function() {
	var serializedParams = this.serialize();
	var obj = paramString2obj(serializedParams);
	return obj;
}
