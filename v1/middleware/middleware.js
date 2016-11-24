var middleware = {};
var dbSchema = require('../../database/schema');
var sha1 = require('sha1');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var userHandler = require('../handlers/userHandler');

/**
 * @author Victor Axelsson
 * Checks if a user exists in the db with the specified username
 */
middleware.userExists = function(req, res, next) {
    dbSchema.User.findOne({
        username: req.body.user.username
    }, function(err, _user) {
        if (!err) {
            if (!_user) {
                res.send(500, "No user by that username");
            } else {
                if (sha1(req.body.user.password + _user.salt) == _user.password) {
                    next();
                } else {
                    res.send(400, "Not logged in");
                }
            }
        } else {
            res.send(500, err);
        }
    });
}

/**
 * @author Victor Axelsson
 * Checks if the specified params id is a valid mongodb id
 */
middleware.haveValidId = function(req, res, next) {
    if (ObjectId.isValid(req.params.id)) {
        var str = req.params.id + '';

        var len = str.length,
            valid = false;
        if (len == 12 || len == 24) {
            valid = /^[0-9a-fA-F]+$/.test(str);
        }

        if (valid) {
            next();
        } else {
            res.send(400, "Bad request: provided a bad id");
        }

    } else {
        res.send(400, "Bad request: provided a bad id");
    }
}

/** 
 * @author Victor Axelsson
 * Api key was provided
 */
middleware.validToken = function(req, res, next) {

    // Token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // Check if api key is valid
    userHandler.validToken(token, function(err, result) {

        // Check result
        if (err) {
            console.log("result was an error ");
            res.send(500, "Server error: ", +err);
        } else {

            if (result) {

                // if everything is good, save to request for use in other routes
                req.decoded = result;
                next();

            } else {
                res.send(400, "Bad request, you must provide a valid token");
            }
        }
    });
}

module.exports = middleware;
