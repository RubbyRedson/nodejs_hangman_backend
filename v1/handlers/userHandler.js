var userHandler = {};

var sha1 = require('sha1');
var crypto = require('crypto');
var dbSchema = require('../../database/schema');
var jwt = require('jsonwebtoken');
var env = require('../helpers/environment').getEnvironment();

userHandler.register = function(req, res) {
    dbSchema.User.findOne({
        username: req.body.username
    }, function(err, _user) {
        if (!err) {
            if (!_user) {
                var salt = crypto.randomBytes(20).toString('hex');
                var token = crypto.randomBytes(20).toString('hex');
                var userModel = {
                    username: req.body.username,
                    password: sha1(req.body.password + salt),
                    salt: salt,
                    isVerified: false
                };

                dbSchema.User.create(userModel, function(err, user) {
                    if (err) throw err;

                    var token = userHandler.createToken(user);

                    res.status(200).send({
                        username: user.username,
                        token: token
                    });
                });
            } else {
                res.status(400).send("user already exists");
            }
        }
    });
}


/** 
 * Verify password
 * @author Victor Axelsson
 */
userHandler.verifyPassword = function(password1, password2, salt) {
    return password1 == sha1(password2 + salt) ? true : false;
};

/** 
 * Create token
 * @author Victor Axelsson
 */
userHandler.createToken = function(user) {

    console.log(user);
    console.log(env.token);
    console.log(env.tokenValid);

    return jwt.sign(user, env.token, {
        expiresInMinutes: env.tokenValid
    });

    //return crypto.randomBytes(20).toString('hex');
}

/** 
 * Valid token
 * @author Victor Axelsson
 */
userHandler.validToken = function(token, callback) {

    // Check that key is okey
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, env.token, function(err, result) {
            callback(null, (result ? true : false));
        });

    } else {
        callback(null, false);
    }
};

userHandler.login = function(req, res) {

    // Find user
    dbSchema.User.findOne({
        username: req.body.username
    }, function(err, result) {

        // Check result
        if (result) {

            // Check that password matches
            if (userHandler.verifyPassword(result.password, req.body.password, result.salt)) {

                res.status(200).send({
                    _id: result._id,
                    username: result.username,
                    token: userHandler.createToken(result)
                });

            } else {
                res.status(400).send({
                    status: 400,
                    message: "Wrong password"
                });
            }
        } else {

            res.status(400).send({
                status: 400,
                message: "User doesn't exists"
            });
        }
    });
}

module.exports = userHandler;
