'use strict'
var url = require('url');
var config = require('../config')();
var services = require('./services.js');
var utils = require('./utils.js');

/**
 * Location middleware - listens for :location parameter and fetchies GPS coordinates from location model. 
 */
var location = function(req,res,next,location){
	services.location(location,function(err,data){
		res.coords = !err ? data : undefined;
		return next();
	});
}


/**
 * Day middleware - listens for :day parameter and fetches datetime UNIX (timestamp) from day model. 
 */
var day = function(req,res,next,day){
	services.day(day,function(err,data){
		res.datetime = !err ?data : 'Invalid date';
		return next();
	});
}


/**
 * Forecast middleware - uses results of both previous middlwares.
 * Fetches forecast.io payload from forecast model and transform it according to passed parameters 
 * via formatter utility. 
 */
var forecast = function(req,res,next){
	var coords = res.coords;
	if (!coords) {
			res.status(500);
			res.set('Content-Type','text/html');
			res.send('Error:Location error');
			return next();
	}
	if (res.datetime=='Invalid date') {
			res.status(500);
			res.set('Content-Type','text/html');
			res.send('Error:Invalid date');
			return next();		
	}
	var datetime = Math.round(res.datetime/1000); // Forecast.io uses timestamp rounded to seconds
	var url_parts = url.parse(req.url, true); // here we are parsing url in order to extract optional query parameters
	var query = url_parts.query; // this is optional query parameters
	var forecastURL = config.forecastURL; 
	services.forecast(forecastURL,coords.lat,coords.lng,datetime,query,function(err,result){
		if (!err) {
			// utils.formatter transforms API response according to passed query parameters - output = "json"|"xml"|"html".
			// "html" requires additional parameter "template" - template's filename from "templates" folder 
			utils.formatter(query,result,function(output){
				res.set('Content-Type',output.contentType);
				res.send(output.content);
				return next();
			});
		}
		else{
			res.status(500);
			res.set('Content-Type','text/html');
			res.send('Error:',result);
			return next();
		}				
		
	});		
}

module.exports.location = location;
module.exports.day = day;
module.exports.forecast = forecast;
