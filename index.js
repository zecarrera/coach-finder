var http = require('http');
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var seedDB = require("./seeds");
var Topic = require("./models/topic");
var MessageFormatter = require("./message-formatter");
var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;
var app = express();

mongoose.connect("mongodb://localhost/coach_finder", {
    useMongoClient: true
});

app.use(bodyParser.urlencoded({
    extended: true
}));
seedDB();

const PORT = 3131;

// Lets start our server
app.listen(PORT, function() {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Coach Finder listening on port " + PORT);
});

// This route handles GET requests to our root ngrok address and responds with the same "Ngrok is working message" we used before
app.get('/', function(req, res) {
    res.send('Ngrok is working! Path Hit: ' + req.url);
});

// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
app.get('/oauth', function(req, res) {
    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
    if (!req.query.code) {
        res.status(500);
        res.send({
            "Error": "Looks like we're not getting code."
        });
        console.log("Looks like we're not getting code.");
    } else {
        // We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
        request({
            url: 'https://slack.com/api/oauth.access', //URL to hit
            qs: {
                code: req.query.code,
                client_id: clientId,
                client_secret: clientSecret
            }, //Query string data
            method: 'GET',

        }, function(error, response, body) {
            if (error) {
                console.log(error);
            } else {
                res.json(body);
            }
        });
    }
});

// Route the endpoint that our slash command will point to and send back a simple response to indicate that ngrok is working
app.post('/command', function(req, res) {
    res.send('Your ngrok tunnel is up and running!');
});

app.post('/coach', function(req, res) {
    var newTopic = {
        coachSlackId: req.body.user_id,
        coachUsername: req.body.user_name,
        topicTitle: req.body.text
    };
    Topic.create(newTopic, function(error, result) {
        if (error) {
            console.log(error);
        } else {
            console.log("Topic created");
            res.send(MessageFormatter.formatSuccessMessage(result));
        }
    });

});

app.post('/learn', function(req, res) {
    topicToLearn = req.body.text;
    if (topicToLearn.toLowerCase() === "everything") {
        Topic.find({}, function(error, foundTopics) {
            if (error) {
                console.log(error);
            } else {
                var textToSendBack = "";
                foundTopics.forEach(function(topic) {
                    textToSendBack = textToSendBack + topic.topicTitle + " - " + "<@" + topic.coachUsername + ">\n";
                });
                textToSendBack = MessageFormatter.formatTopicList(textToSendBack);
                res.send(textToSendBack);
            }
        });
    } else {
        var query = getTopics(topicToLearn);
        query.exec(function(err, foundTopics) {
            if (err) {
                return console.log(err);
            } else {
                var textToSendBack = "";
                if(foundTopics.length > 0){
                    foundTopics.forEach(function(topic) {
                        textToSendBack = textToSendBack + topic.topicTitle + " - " + "<@" + topic.coachSlackId + ">\n";
                    });
                    textToSendBack =  MessageFormatter.formatTopicList(textToSendBack);
                }else{
                    textToSendBack = MessageFormatter.topicNotFound();
                }
                res.send(textToSendBack);
            }
        });
    }
});

function getTopics(topicTitle) {
    var query = Topic.find({
        topicTitle: topicTitle
    });
    return query;
}
