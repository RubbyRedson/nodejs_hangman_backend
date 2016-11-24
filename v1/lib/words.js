var words = {};

var wordList = [];
var fs = require("fs");
var readline = require("readline");

words.getRandomWord = function (callback) {
    if (wordList.length == 0) {
        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream('words.txt')
        });

        lineReader.on("line", function (line) {
            wordList.push(line)
        })

        lineReader.on("close", function () {
            var word = wordList[Math.floor(Math.random()*wordList.length)];
            callback(null, word)
        })
    } else {
        var word = wordList[Math.floor(Math.random()*wordList.length)];
        callback(null, word)
    }
};


module.exports = words;