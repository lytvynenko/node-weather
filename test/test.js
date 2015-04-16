
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.TEST_ENV = process.env.TEST_ENV || 'test';

var exit = process.exit;
process.exit = function (code) {
  setTimeout(function () {
      exit();
  }, 200);
};

var supertest = require('supertest');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should;

require('../app.js');

var api = supertest('http://localhost:3000');
var services = require('../app/services.js');
var utils = require('../app/utils.js');
var config = require('../config')();

describe('Services module',function(){
	it('should contain "location" model',function(done){
		expect(services).to.have.property('location');
		expect(services.location).to.be.a('function');
		done();
	});

	it('should contain "forecast" method',function(done){
		expect(services).to.have.property('forecast');
		expect(services.forecast).to.be.a('function');
		done();
	});

	it('should contain "day" method',function(done){
		expect(services).to.have.property('day');
		expect(services.day).to.be.a('function');
		done();
	});

describe('"Location" service',function(done){

	it('return JSON object with "lat" and "lng" properties as number for "sydney" location',function(done){
		services.location('sydney',function(err,result){
			expect(result).to.have.keys('lat','lng');
			done();			
		})
	});

	it('return JSON object with "lat" and "lng" properties for "Melbourne, Victoria, Australia" location',function(done){
		services.location('Melbourne, Victoria, Australia',function(err,result){
			expect(result).to.have.keys('lat','lng');
			done();			
		})
	});

	it('return error for invalid input "123123123',function(done){
		services.location('123123123',function(err,result){
			expect(err);
			done();			
		})
	});

	it('return error for invalid input "京京京',function(done){
		services.location('京京京',function(err,result){
			expect(err);
			done();			
		})
	});

});


describe('"Day" service',function(done){

	it('return current imestamp (a number) value',function(done){
		services.day('today',function(err,result){
			var now = Math.round(new Date().getTime()/1000);
			expect(result).to.be.a('number');
			done();			
		})
	});


	it('return correct timestamp (a number) value for next sunday',function(done){
		services.day('sunday',function(err,result){
			var now = new Date().getTime();
			expect(new Date(result).getDay()).to.be.equal(0);
			expect(result>now).to.equal(true);
			done();			
		})
	});

	it('return correct timestamp (as number) for date parameter passed as date string presendation',function(done){
		services.day('04.30.2015',function(err,result){
			expect(new Date(result).getDate()).to.be.equal(30);
			done();			
		})
	});


	it('return "Invalid date" for invalid day value',function(done){
		services.day('blabla123',function(err,result){
			expect(err);
			expect(result).to.be.equal('Invalid date');
			done();			
		})
	});

	it('return "Invalid date" for invalid day value',function(done){
		services.day('OMGWTF',function(err,result){
			expect(err);
			expect(result).to.be.equal('Invalid date');
			done();			
		})
	});


});


describe('"Forecast" service',function(done){

	it('return a valid forecast JSON object for -33.8674869, 151.2069902 coordinates',function(done){
		services.forecast(config.forecastURL,-33.8674869,151.2069902,undefined,undefined,function(err,result){
			expect(result).to.have.property('latitude');
			done();			
		})
	});

	it('return a valid forecast JSON object for -33.8674869, 151.2069902 coordinates for April 1st 2015',function(done){
		var datetime = Math.round(new Date('04.01.2015').getTime()/1000);
		services.forecast(config.forecastURL,-33.8674869,151.2069902,datetime,undefined,function(err,result){
			expect(result).to.have.property('latitude');
			expect(new Date(result.currently.time*1000).getDate()).to.equal(1);
			done();			
		})
	});

	it('return a valid forecast JSON object for -33.8674869, 151.2069902 coordinates excluding "flags" section',function(done){
		services.forecast(config.forecastURL,-33.8674869,151.2069902,undefined,{exclude:'flags'},function(err,result){
			expect(result).to.not.have.property('flags');
			done();			
		})
	});

	it('return a error for broken ForecastIO endpoint',function(done){
		services.forecast(config.forecastURLBroken,-33.8674869,151.2069902,undefined,{exclude:'flags'},function(err,result){
			expect(err);
			expect(result).to.be.equal('Forecast API request error');
			done();			
		})
	});



});


	describe('"Formatter" method in Utils module',function(done){

		it('return json object by default',function(done){
			utils.formatter({},{"key":"value"},function(result){
				expect(result.content).to.be.a('object');
				expect(result.content.key).to.be.equal('value');
				done();			
			})
		});


		it('return xml file with output=xml option',function(done){
			utils.formatter({output:"xml"},{"key":"value"},function(result){
				expect(result.content).to.be.a('string');
				expect(result.content).to.contain('<result>');
				done();			
			})
		});

		it('return html file with output=html option',function(done){
			utils.formatter({output:"html",template:'test.jade'},{"key":"value"},function(result){
				expect(result.content).to.be.a('string');
				done();			
			})
		});
	});


	describe('"forecastParams" method in Utils module',function(done){

		it('return query string for valid options',function(done){
			var result = utils.forecastParams({"units":"si"});
				expect(result).to.be.a('string');
				expect(result).to.be.contain('units=si');
				done();			
		});

		it('return false for invalid parameter',function(done){
			var result = utils.forecastParams({"blabla":"blabla"});
				expect(!result);
				done();			
		});


		it('return false for invalid parameter\'s options',function(done){
			var result = utils.forecastParams({"units":"bla"});
				expect(!result);
				done();			
		});


		it('return false for invalid exclude parameter options',function(done){
			var result = utils.forecastParams({"exclude":"blabla,bla-bla"});
				expect(!result);
				done();			
		});


	});

});


describe('Weather endpoint',function(){

	it('/ should return a 200 response',function(done){
		api.get('/')
		.expect(200,done)
	});
		it('should return a 200 response',function(done){
		api.get('/weather/sydney')
		.set('Accept','application/json')
		.expect(200,done);
	});

	it('should return a valid forecast.io JSON object for "/weather/sydney/friday" endpoint and response date is a Friday',function(done){
		api.get('/weather/sydney/friday')
		.set('Accept','application/json')
		.expect(200)
		.end(function(err,result){
			expect(result.body).to.have.keys(['latitude','longitude','offset','timezone','currently','hourly','daily','flags']);
			expect(result.body.currently.temperature).to.not.equal(null);
			expect((new Date(result.body.currently.time*1000)).getDay()).to.be.equal(5);
			done();
		})
	});

});