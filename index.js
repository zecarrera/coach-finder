let http = require('http');
let express = require('express');
let request = require('request');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let seedDB = require("./seeds");
let Topic = require("./models/topic");
let Registration = require("./models/registration");
let MessageFormatter = require("./message-formatter");
let dataAccess = require("./data-manager/data-access");
let clientId = process.env.CLIENT_ID;
let clientSecret = process.env.CLIENT_SECRET;
let app = express();

mongoose.connect("mongodb://localhost/coach_finder", {
    useMongoClient: true
});

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));
// seedDB();

const PORT = 3131;

// Lets start our server
app.listen(PORT, function() {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Coach Finder listening on port " + PORT);
});

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


app.post('/coach', function(req, res) {
    let slots = extractTotalSlots(req.body.text);
    let newTopic = {
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
    userId = req.body.user_id;
    if (topicToLearn.toLowerCase() === "everything") {
        Topic.find({}, function(error, foundTopics) {
            if (error) {
                console.log(error);
            } else {
                MessageFormatter.formatTopicList(foundTopics, userId, function(textToSendBack){
                    res.send(textToSendBack);
                });
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
                    textToSendBack = MessageFormatter.formatTopicList(foundTopics, userId);
                }else{
                    textToSendBack = MessageFormatter.topicNotFound();
                }
                res.send(textToSendBack);
            }
        });
    }
});

app.get('/participants/:id', function(req, res) {
    let requestedTopicId = mongoose.Types.ObjectId(req.params.id);
    let topicTitle;
    Topic.findById(requestedTopicId, function(error, foundTopic){
        if (error) {
            console.log(error);
            res.status(404).send('Not found');
        } else {
            Registration.find({topicId: requestedTopicId}, function(error, registeredParticipants) {
                if (error) {
                    console.log(error);
                    res.status(404).send('Not found');
                } else {
                    res.render('registrations/show', {participants:registeredParticipants, topic: foundTopic});
                }
            });
        }
    });
});

app.post('/registration', function (req, res) {
    let payload = JSON.parse(req.body.payload);
    let topicId = payload.actions[0].value;
    let user = payload.user;

    dataAccess.findById(Topic, topicId, (foundTopic) => {
        dataAccess.isUserRegisteredOnTopic(user.id, topicId, (isAlreadyRegistered) => {
            if (isAlreadyRegistered) {
                deleteRegistration(topicId, user, foundTopic, (successDropOutMessage) => {
                    res.send(successDropOutMessage);
                });
            } else {
                if (foundTopic.availableSlots > 0) {
                    createRegistration(foundTopic, user, topicId, (successRegistrationMessage) => {
                        res.send(successRegistrationMessage);
                    });
                } else {
                    res.send(MessageFormatter.formatErrorRegistrationMessage());
                }
            }
        });
    });
});

extractTitle = (message) => {
    let endIndex = message.indexOf("with") -1;
    return message.substring(0, endIndex);
};

extractTotalSlots = (message) => {
    let startIndex = message.indexOf("with") + 4;
    let endIndex = message.indexOf("slots");
    return Number(message.substring(startIndex, endIndex));
};

getTopics = (topicTitle) => {
    let query = Topic.find({
        topicTitle: topicTitle
    });
    return query;
};

deleteRegistration = (topicId, user, foundTopic, callback) => {
    let registrationToDelete = { topicId: topicId, applicantSlackId: user.id };
    dataAccess.delete(Registration, registrationToDelete, (isDeleted) =>{
        if(isDeleted){
            foundTopic.availableSlots = foundTopic.availableSlots + 1;
            foundTopic.save();
            console.log("unregistered successfully");
            let successMessage = MessageFormatter.formatSuccessDropOutMessage(foundTopic.topicTitle, user.name);
            callback(successMessage);
        }else{
            console.log("an error happened while trying to delete registration");
        }
    })
}

createRegistration = (foundTopic, user, topicId, callback) => {
    let newRegistration = {
        applicantSlackId: user.id,
        applicantUsername: user.name,
        topicId: topicId
    };
    decrementAvailableSlots(foundTopic, () =>{
        dataAccess.insert(Registration, newRegistration, (createdRegistration) => {
            if (createdRegistration){
                let successMessage = MessageFormatter.formatSuccessRegistrationMessage(foundTopic.topicTitle, createdRegistration.applicantUsername);
                callback(successMessage);
            }else{
                console.log("Failed to create registration");
            }
        })
    });
}

decrementAvailableSlots = (foundTopic, callback) => {
    foundTopic.availableSlots = foundTopic.availableSlots - 1;
    foundTopic.save();
    callback();
}

