var rateLimit = {};

var defaults = require('defaults');

rateLimit.RateLimit = function(options) {

    options = defaults(options, {
        // window, delay, and max apply per-ip unless global is set to true
        windowMs: 60 * 1000, // milliseconds - how long to keep records of requests in memory
        penaltyTime: 60 * 60 * 1000,
        delayAfter: 1, // how many requests to allow through before starting to delay responses
        delayMs: 1000, // milliseconds - base delay applied to the response - multiplied by number of recent hits from user's IP
        max: 200, // max number of recent connections during `window` miliseconds before sending a 429 response
        message: 'Too many requests, please try again later.',
        statusCode: 429 // 429 status = Too Many Requests (RFC 6585)
    });

    // this is shared by all endpoints that use this instance
    var hits = {};
    var locks = {};

    function rateLimit(req, res, next) {
        var ip = req.ip;

        if (hits[ip]) {
            hits[ip]++;
        } else {
            hits[ip] = 1;
        }

        console.log("testing for rate");

        if (options.max && (hits[ip] > options.max || locks[ip] > options.max)) {

            if (locks[ip]) {
                locks[ip]++;
                delete hits[ip];
            } else {
                locks[ip] = hits[ip];
            }

            console.log("AP rate limiting on IP: " + ip + " Tried: " + locks[ip] + " times");

            //Maybe log ip?
            return res.status(options.statusCode).send({status: options.statusCode, message:options.message});
        } else {
            next();
        }
    }

    function resetAll() {
        hits = {};
        locks = {};
    }

    function resetUnlocked() {
        hits = {};
    }

    // simply reset ALL hits every windowMs
    setInterval(resetAll, options.penaltyTime);
    setInterval(resetUnlocked, options.windowMs);



    // export an API to allow hits from one or all IPs to be reset
    function resetIp(ip) {
        delete hits[ip];
    }

    rateLimit.resetIp = resetIp;

    return rateLimit;
}

module.exports = rateLimit;
