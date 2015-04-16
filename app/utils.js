'use strict'
var o2x = require('object-to-xml');
var jade = require('jade');
var fs = require('fs');

/**
 * forecastParams - parse and valided optional API parameters passed via query string.
 * @param  {Object} options [Forecast API options]
 						 	units=[setting]: Return the API response in units other than the default Imperial units. In particular, the following settings are possible:
							us: The default, as outlined above.
							si: Returns results in SI units.
							ca: Identical to si, except that windSpeed is in kilometers per hour.
							uk: Identical to si, except that windSpeed is in miles per hour, as in the US. (This option is provided because adoption of SI in the UK has been inconsistent.)
							auto: Selects the relevant units automatically, based on geographic location.
							exclude=[blocks]: Exclude some number of data blocks from the API response. This is useful for reducing latency and saving cache space. [blocks] should be a comma-delimeted list (without spaces) of any of the following: currently, minutely, hourly, daily, alerts, flags. (Crafting a request with all of the above blocks excluded is exceedingly silly and not recommended.)
							extend=hourly: When present on a forecast request, return hourly data for the next seven days, rather than the next two. (This option is ignored on time machine requests. When using this option, we strongly recommend ensuring that your HTTP client supports compression.)
							lang=[language]: Return text summaries in the desired language. (Please be advised that units in the summary will be set according to the units option, above, so be sure to set both options as needed.) [language] may be bs (Bosnian), de (German), en (English, which is the default), es (Spanish), fr (French), it (Italian), nl (Dutch), pl (Polish), pt (Portuguese), ru (Russian), tet (Tetum), or x-pig-latin (Igpay Atinlay). (If a different language is desired, please consider contributing to our API translation module on Github.)
 * 
 * @return String formed to URL query or false if validation failed
 */
var forecastParams = function(options){
		// contains all possible valid options for Forecast.io API 
		var validOptions = {
			"units":["us","si","ca","uk","auto"],
			"exclude":["currently", "minutely", "hourly", "daily", "alerts", "flags"],
			"extend":["hourly"],
			"lang":["bs","de","en","es","fr","it","nl","pl","pt","ru","tet","x-pig-latin"]
		}

		var optionsQuery = "?";
																//iterate through the passed options and validate each passed option  
		for (var option in options) {
			if (!validOptions.hasOwnProperty(option)) continue; // we'll skip all invalid options passed through options object
			var optionValue = options[option];
			if (option=="exclude") {							// As "exclude" supports multiple values, we'll check them as splitted array
				var arrValues = optionValue.split(',');
				arrValues.forEach(function(value){
					if (validOptions[option].indexOf(value)==-1) {
						return false;
					}
				})				
			}
			else
			{
				if (validOptions[option].indexOf(optionValue)==-1) {
						return false;
				}
			}
			optionsQuery=optionsQuery+option+'='+optionValue+'&';
		}
		return optionsQuery;
}
/**
 * jadeCompiler - tiny jade templates compiles
 * @param  {String}   template  - templates filename (JADE templates stored in "templates" folder)
 * @param  {Object}   data     data to pass in the template
 * @return {String}   returns compiled HTML string
 */
var jadeCompiler = function(template,data,callback){
	fs.readFile('templates/'+template+'.jade', 'utf8', function (err, rawTemplate) {
	    var fn = jade.compile(rawTemplate);
	    var html = fn(data);
	    return callback(html);
	});
}


/**
 * formatter - formats JSON response to JSON (no transformation), XML or HTML view.
 * @param  {Object}   options  - output options
 *                             	contains up to 2 parameters
 *                             	"output" - output format {"json"|"xml"|"html"}
 *                             	"template" - required only for "html" output - template's filename
 * @return {Object}   returns objects with correct Content-type property and actual content
 */

var formatter = function(options,data,callback){
	var result = {};
	switch (options.output) {
		case 'xml':{
			result.contentType = 'text/xml';
			result.content = o2x({"result":data});
			return callback(result);
			break;
		}
		case 'html':{
			jadeCompiler(options.template,data,function(html){
				result.contentType = 'text/html';
				result.content = html;
				return callback(result);
			});
			break;
		}
		default:{
			result.contentType = 'application/json';
			result.content = data;
			return callback(result);
		}
	}
}

module.exports.formatter = formatter;
module.exports.forecastParams = forecastParams;
