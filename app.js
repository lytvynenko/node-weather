var config = require('./config')();
var express = require('express');
var http = require('http');
var morgan = require('morgan');
var app = express();
var middleware = require('./app/middleware.js');

//tiny helper for templates
app.locals.dateFormat = function(value){
	return new Date(value*1000).toString();
}


// :location route param middleware
app.param('location',middleware.location);

// :day route param middleware
app.param('day',middleware.day);

// main response forming middleware
app.use('/weather/:location/:day*?',middleware.forecast);

//logger atttached too
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

// Root route - nothing here as "You're free to elaborate on the front-end code as much as you like, 
// but we'll be primarily evaluating the back-end aspects."
app.get('/',function(req,res){
	res.send('please use /weather endpoint');
});

// Primary route
app.get('/weather/:location/:day*?');

//Server start
app.listen(config.port, function () {
  console.log('Example app listening on port '+config.port);
});
