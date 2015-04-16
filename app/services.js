var request = require('request');
var moment = require('moment');
var utils = require('./utils');

/**
 * location service
 * @param  {String}  location  - geographical entity name
 *
 * Performs geocoding via Google Maps Geocoding API endoint
 * returns "coords" object with "lat" (latitude) and "lng" (longitude) properties.
 */
var location = function(location, callback) {

	request('http://maps.googleapis.com/maps/api/geocode/json?address='+location,function(err,res,data){
		var result = {};
		if (!err && res.statusCode== 200){
			data = JSON.parse(data);
			if (data.results.length == 0) return callback(true,"No location found");
			for (var i = data.results.length - 1; i > -1; i--) {
				if (data.results[i].geometry && data.results[i].geometry.location) {
					var coords = {};
					coords.lat = data.results[i].geometry.location.lat;
					coords.lng = data.results[i].geometry.location.lng;
					result.error = false;
					result.payload = coords;
					return callback(result.error,result.payload);
				}
			}
		}
		else
		{
			return callback(true,"Google Maps Geolocation API error: statusCode:"+res.statusCode);
		}	
	})
}


/**
 * forecast service
 * @param  {String}  forecastURL  -Forecast.io endoint URL
 * @param  {Float}  lat  - GPS latitude
 * @param  {Float}  lng  - GPS longitude
 * @param  {Int}  datetime  - datetime UNIX timestamp
 * @param  {Object}  options  - additional request options 
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
 * Performs geocoding via Google Maps Geocoding API endoint
 * returns "coords" object with "lat" (latitude) and "lng" (longitude) properties.
 */

var forecast = function(forecastURL,lat,lng,datetime,options,callback) {

	var result = {};

	// options are parsing and validation by "utils.forecastParams" method. 
	var optionsQuery = utils.forecastParams(options) || '';

	//forming forecast.io request URL
	var forecastURL = forecastURL+lat+','+lng+(datetime ? ','+datetime:'')+ optionsQuery; 

	request(forecastURL,function(err,res,data){
		if (!err && res.statusCode== 200){
			data = JSON.parse(data);
			result.error = false;
			result.payload = data;
		}
		else
		{
			result.error = true;
			result.payload = "Forecast API request error";
		}

		return callback(result.error,result.payload);
	})
}

/**
 * Day service
 * @param  {String}  strDay  - weekday (i.e. monday,tuesday..) or "today" or "04.30.2015"  
 *
 * The weekday is always in the future  
 * If the requested day is the same as the current day, the weather returned should be for one week from the current day.).
 * 
 * returns datetime UNIX timestamp 
 */
var day = function(strDay,callback){
			var result = {};
			var pattern = new RegExp(/^([^0-9]*)$/); 					// Regular expression - not any digits here!
			if (pattern.test(strDay)) {
				var today = new Date();
				if (strDay == 'today') {
					result.error = false;
					result.payload = today.getTime();
					return callback(result.error,result.payload);
				}
				else
				{
					
					var arrDays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
					if (arrDays.indexOf(strDay)==-1) { 
						result.error = true;
						result.payload = "Invalid date"; 
						return callback(result.error,result.payload);
					}
					else
					{	
						var dayDayOfWeek = arrDays.indexOf(strDay); 	// day of week for requested date
						var todayDay = new Date().getDay(); 			// today's day of week
						if (todayDay==dayDayOfWeek) { 
							var dayAsString = moment().add(7,'days') 	// just add 7 days to get next week's day	
						}
						else
						{
							var dayAsString = todayDay>dayDayOfWeek ? moment().day(dayDayOfWeek).add(7,'days') : moment().day(dayDayOfWeek);
						}
						result.error = false;
						result.payload = new Date(dayAsString.toString()).getTime();
						return callback(result.error,result.payload);
					}
				}
			}
			else
			{
				if (moment(strDay).toString()=='Invalid date') {
					result.error = true;
					result.payload = "Invalid date"; 
				}
				else
				{
					result.error = false;
					result.payload = new Date(moment(strDay)).getTime();
				}
				return callback(result.error,result.payload);
			}
		
	}

module.exports.location = location;
module.exports.forecast = forecast;
module.exports.day = day;
