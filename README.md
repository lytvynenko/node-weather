# node-weather [![Build Status](https://travis-ci.org/lytvynenko/node-weather.png?branch=master)](https://travis-ci.org/lytvynenko/node-weather)

This an example of express.js-based API. 

## Installation

Download node at [nodejs.org](http://nodejs.org) and install it, if you haven't already.

Clone this repository

```sh
git clone https://github.com/lytvynenko/node-weather
```

Install dependencies

```sh
npm install node-weather --save
```

To start the application

```sh
npm start
```
## Files structure


```sh
\app
	middleware.js - express middlewares are here
	services.js - stores services
	utils.js - utility stuff
\config
	index.js - contains app configuration
\coverage - instanbul code coverage tool results
\templates - custom templates for /weather endpoint's html output
	test1.jade
	test2.jade	  		 
\test - tests are here

app.js - main script 
```


## Weather endpoint
 
```sh
Example: http://localhost:3000/weather/vladivostok/tuesday?units=si&lang=ru
```

Weather endpoint accepts two route params and bunch of query params. 

### Route params
```sh
   http://<host>:<port>/weather/:location/:day
```
``:location`` parameter accepts a string with geographic object name. 

   _Examples: "sydney", "Sydney,NSW", "Surry Hills, NSW, Australia"_ 
   
---
 ``:day`` parameter accepts a string with weekday name ('sunday','monday','tuesday','wednesday','thursday','friday','saturday') or 'today' as value for current date.
 
   _Examples:"sunday","today", 

### Query params


+ ``output = json|xml|html`` set results output format. 

+ ``template = <template_name>`` set html output template. 
+ ``units`` return the API response in units other than the default Imperial units. Possible values ``us|si|ca|uk|auto``
+ ``exclude = [blocks]``: Exclude some number of data blocks from the API response. This is useful for reducing latency and saving cache space. should be a comma-delimeted list (without spaces) of any of the following: ``currently``, ``minutely``, ``hourly``, ``daily``, ``alerts``, ``flags``
+ ``lang = [language]`` Return text summaries in the desired language. ``[language]`` may be ``bs`` (Bosnian), ``de`` (German), ``en`` (English, which is the default), ``es`` (Spanish), ``fr`` (French), ``it`` (Italian), ``nl`` (Dutch), ``pl`` (Polish), ``pt`` (Portuguese), ``ru`` (Russian), ``tet`` (Tetum), or ``x-pig-latin`` (Igpay Atinlay)

## Tests

```sh
npm install
npm test
```

## Dependencies

- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [express](https://github.com/strongloop/express): Fast, unopinionated, minimalist web framework
- [jade](https://github.com/jadejs/jade): A clean, whitespace-sensitive template language for writing HTML
- [moment](https://github.com/moment/moment): Parse, validate, manipulate, and display dates
- [morgan](https://github.com/expressjs/morgan): HTTP request logger middleware for node.js
- [request](https://github.com/request/request): Simplified HTTP request client.
- [supertest](https://github.com/visionmedia/supertest): Super-agent driven library for testing HTTP servers

## Dev Dependencies

- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [object-to-xml](https://github.com/wankdanker/node-object-to-xml): Convert any object to XML
- [superagent](https://github.com/visionmedia/superagent): elegant &amp; feature rich browser / node HTTP with a fluent API


## License

MIT