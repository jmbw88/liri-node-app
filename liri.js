require("dotenv").config();

var keys = require('./key');
var request = require('request');
var inquirer = require('inquirer');
var moment = require('moment');
var Spotify = require('node-spotify-api');
var chalk = require('chalk');
var spotify = new Spotify(keys.spotify);

function runLiri() {
inquirer.prompt({
    type: "list",
    name: "choice",
    message: "Hello, friend. Please select an option from the menu.",
    choices: ["Tell me about a movie.", "Tell me about a song.", "Tell me about an upcoming concert.", "How does this work? Show me a demo."]
}).then(liri => {
    switch (true) {
        case liri.choice === "Tell me about a movie.":
            movieThis();
            break;

        case liri.choice === "Tell me about a song.":
            spotifyThisSong();
            break;

        case liri.choice === "Tell me about an upcoming concert.":
            concertThis();
            break;

        case liri.choice === "How does this work? Show me a demo.":
            doWhatItSays();
            break;

        default:
    }
});

    function movieThis() {
        inquirer.prompt({
            type: "input",
            message: "Okay. What movie? ",
            name: "movieName",
        }).then(movieSelection => {
            var queryURL = "http://www.omdbapi.com/?t=" + movieSelection.movieName + "&y=&plot=short&apikey=trilogy";

            request(queryURL, (err, res, body) => {
                if (!err && res.statusCode=== 200) {
                    json = JSON.parse(body);
                    console.log(`
============================================
INFORMATION ABOUT: ${json.Title}
============================================
${chalk.blue.bold(`* This movie came out in: ${json.Year}
* IMDB movie rating: ${json.imdbRating} 
* Country of production: ${json.Country}
* Synopsis: ${json.Plot}
* Cast: ${json.Actors}\n`)}`);
                    askAgain();
                }
            });
        });
    }

    function spotifyThisSong() {
        inquirer.prompt({
            type: "input",
            message: "Okay. What song should we find? ",
            name: "songName"
        }).then(songSelection => {
            spotify.search({ type: 'track', query: songSelection.songName, limit: 20 }, (err, body) => {
                if (err) throw err;
                console.log(`
=========================================================
INFO REGARDING THE SONG: ${body.tracks.items[0].name}
=========================================================
${chalk.blue.bold(`* Artist: ${body.tracks.items[0].artists[0].name}
* Name of song: ${body.tracks.items[0].name}
* To play the song click on the following link: ${chalk.green.underline(`${body.tracks.items[0].preview_url}`)}
* The song's album is called: ${body.tracks.items[0].album.name}\n`)}`);
                askAgain();
            });
        });
    }
    
    function concertThis() {
        inquirer.prompt({
            type: "input",
            message: "Okay. Who do you want to see? ",
            name: "nameOfArtist"
        }).then(artistSelection => {
            var url = "https://rest.bandsintown.com/artists/" + artistSelection.nameOfArtist + "/events?app_id=codingbootcamp";

            request(url, (err, res, body) => {
                if (!err && res.statusCode === 200) {
                    var obj = JSON.parse(body);
                    if (body === 'undefined') {
                        console.log("Please enter another artist.")
                        concertThis();
                    }
                else {
                    for (i=0; i < Object.length; i++) {
                        var newTime = obj[i].datetime;
                        newtime = moment(newTime).format("MM/DD/YYYY");
                        console.log(`
==================================================
${obj[i].lineup} EVENT NUMBER: ${i}
==================================================
${chalk.blue.bold(`* Name of venue: ${obj[i].venue.name}
* Location of venue: ${obj[i].venue.country}, ${obj[i].venue.city}
* Date of event: ${newTime}\n`)}`);
                        askAgain();
                        };
                    };
                };
                });
            });
        };

     function doWhatItSays() {
        var fs = require("fs");
        fs.readFile("random.txt", "utf8", function(error, data) {
            if (error) {
                return console.log(error);
            }
        spotify.search({ type: 'track', query: data, limit: 20 }, (err, body) => {
            if (err) throw err;
            console.log(`
Let me know what you're looking for, and I'll look it up for you, like this;
=========================================================
INFO REGARDING THE SONG: ${body.tracks.items[0].name}
=========================================================
${chalk.blue.bold(`* Artist: ${body.tracks.items[0].artists[0].name}
* Name of song: ${body.tracks.items[0].name}
* To play the song click on the following link: ${chalk.green.underline(`${body.tracks.items[0].preview_url}`)}
* The song's album is called: ${body.tracks.items[0].album.name}\n`)}`);
            askAgain();
        });
    }); 
};
};

function askAgain (){
    inquirer.prompt({
        type: "list",
        name: "choice",
        message: "Would you like to ask something else?",
        choices: ["Yes", "No"]
    }).then(liri => {
        if (liri.choice === "Yes") {
            runLiri();
        }
        else {
            console.log("Okay. Good bye!")
        }
});
}

runLiri()
