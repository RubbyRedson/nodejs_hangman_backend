var startHandler = {};

var jwt = require('jsonwebtoken');
var env = require('../helpers/environment').getEnvironment();
var words = require('../lib/words')

var userWords = {};
var userGuesses = {};
var userMoves = {};
startHandler.start = function (req, res) {
    var username = req.params.username
    if (!!(username)) {
        var word = words.getRandomWord(function (err, word) {
            if (err) {
                throw err
            } else {
                userWords[username] = word
                userGuesses[username] = {}
                userMoves[username] = 6

                console.log(req.params.username + " " + word)

                res.status(200).send({
                    username: username,
                    wordLength: word.length,
                    triesLeft: 6
                });
            }
        });
    } else {
        res.status(400).send({
            status: 400,
            message: "No username provided"
        });
    }
}

fillWord = function (username) {
    var word = userWords[username]
    var guesses = userGuesses[username]
    var gameWord = ""
    for (i = 0; i < word.length; i++)
        if (guesses[word.charAt(i)])
            gameWord += word.charAt(i)
        else
            gameWord += "-"
    return gameWord
}

startHandler.guess = function (req, res) {

    console.log(req.params.username)
    console.log(req.body)
    var username = req.params.username
    if (!!(username)) {
        if (userWords[username]) {
            var word = userWords[username]
            var guessesLeft = userMoves[username]
            if (guessesLeft <= 0) {
                res.status(200).send({
                    status: 200,
                    username: username,
                    success: false,
                    tries: userMoves[username],
                    word: word,
                    message: "You loose, gave over. The word was " + word
                });
            } else {
                var guesses = userGuesses[username]
                var guess = req.body.guess
                if (!guess) {

                    res.status(400).send({
                        status: 400,
                        message: "No guess provided"
                    });
                } else {
                    if (guesses[req.body.guess]) {
                        userMoves[username] = guessesLeft - 1
                        if (userMoves[username] <= 0) {
                            res.status(200).send({
                                status: 200,
                                username: username,
                                success: false,
                                tries: userMoves[username],
                                word: word,
                                message: "You loose, gave over. The word was " + word
                            });
                        } else {
                            res.status(200).send({
                                status: 200,
                                username: username,
                                success: false,
                                tries: userMoves[username],
                                word: fillWord(username),
                                message: "You have already made that guess. Moves left " + userMoves[username]
                            });
                        }
                    } else {
                        if (guess.length == 1) {
                            userGuesses[username][guess] = 1 // add guess
                            var success = true
                            if (!word.includes(guess)) {
                                success = false
                                userMoves[username] = guessesLeft - 1
                            }

                            var gameWord = fillWord(username)
                            if (gameWord.includes('-')) {

                                if (guessesLeft <= 0) {
                                    res.status(200).send({
                                        status: 200,
                                        username: username,
                                        success: false,
                                        tries: userMoves[username],
                                        word: word,
                                        message: "You loose, gave over. The word was " + word
                                    });
                                }
                                res.status(200).send({
                                    status: 200,
                                    username: username,
                                    success: success,
                                    tries: userMoves[username],
                                    word: fillWord(username),
                                    message: "Current state " + gameWord + ". Moves left " + userMoves[username]
                                });
                            }
                            else {
                                res.status(200).send({
                                    status: 200,
                                    username: username,
                                    success: success,
                                    tries: userMoves[username],
                                    word: fillWord(username),
                                    message: "You win! The word was " + word + ". Moves left " + userMoves[username]
                                });

                            }
                        } else {
                            userGuesses[username][guess] = 1 // add guess
                            if (word === guess) {
                                res.status(200).send({
                                    status: 200,
                                    username: username,
                                    success: true,
                                    tries: userMoves[username],
                                    word: word,
                                    message: "You win! The word was " + word + ". Moves left " + userMoves[username]
                                });
                            } else {
                                userMoves[username] = guessesLeft - 1
                                var gameWord = fillWord(username)
                                res.status(200).send({
                                    status: 200,
                                    username: username,
                                    success: false,
                                    tries: userMoves[username],
                                    word: fillWord(username),
                                    message: "Current state " + gameWord + ". Moves left " + userMoves[username]
                                });
                            }
                        }
                    }
                }
            }
        } else {
            res.status(400).send({
                status: 400,
                message: "You do not have a game running"
            });

        }
    } else {
        res.status(400).send({
            status: 400,
            message: "No username provided"
        });
    }
}
module.exports = startHandler;
