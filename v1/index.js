var express = require('express'),
	endpoints = require('./endpoints');

var app = express();

//Rate limiter for the API. 
//Must be used specifically on each endpoint, otherwise it will rate limit the file server.
var RateLimit = require('./helpers/rateLimit');
var limiter = RateLimit.RateLimit({
    penaltyTime: 60 * 60 * 1000,
    windowMs: 60 * 1000, // miliseconds - how long to keep records of requests in memory
    delayMs: 0, // milliseconds - base delay applied to the response - multiplied by number of recent hits from user's IP
    max: 300, // max number of recent connections during `window` miliseconds before (temporarily) bocking the user.
    global: false // if true, IP address is ignored and setting is applied equally to all requests (I don't think this works)
});

for (var key in endpoints) {

	var endpoint = endpoints[key];

    //Add as first middleware on endpoint
    //endpoint.middleware.unshift(limiter);


	if(endpoint.middleware)
		app[endpoint.method](endpoint.url, endpoint.middleware, endpoint.handler);
	else	
		app[endpoint.method](endpoint.url, endpoint.handler);

}

module.exports = exports = app