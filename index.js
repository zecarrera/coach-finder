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
    res.send('Local tunnel is working! Path Hit: ' + req.url);
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
    res.send('Your local tunnel is up and running!');
});

app.post('/coach', function(req, res) {
    let slots = extractTotalSlots(req.body.text);
    var newTopic = {
        coachSlackId: req.body.user_id,
        coachUsername: req.body.user_name,
        topicTitle: extractTitle(req.body.text),
        totalSlots: slots,
        availableSlots: slots
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
                var textToSendBack = MessageFormatter.formatTopicList(foundTopics);
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
                    textToSendBack = MessageFormatter.formatTopicList(foundTopics);
                }else{
                    textToSendBack = MessageFormatter.topicNotFound();
                }
                res.send(textToSendBack);
            }
        });
    }
});

app.post('/registration', function(req, res) {
    //payload data is properly hitting the endpoint, need now to :
    //1. create object with topic title, user name and id
    //2. submit registration
    //2.1 --1 on the availableSlots
    //when that is finished, implement the unregistration
    //then update how the list of topics is built, to:
    //1 - show when no slots are available
    //2 - change button text if user is already reigsteerd
    console.log("registration - user");
    var payload = JSON.parse(req.body.payload);
    console.log(payload);
    console.log("actions - topic title");
    payload.actions.forEach(action => {
        console.log(action);
    });

    var user = payload.user;
    console.log(JSON.stringify(user));
});

function extractTitle(message){
    let endIndex = message.indexOf("with") -1;
    return message.substring(0, endIndex);
}

function extractTotalSlots(message){
    let startIndex = message.indexOf("with") + 4;
    let endIndex = message.indexOf("slots");
    return Number(message.substring(startIndex, endIndex));
}

function getTopics(topicTitle) {
    var query = Topic.find({
        topicTitle: topicTitle
    });
    return query;
}
