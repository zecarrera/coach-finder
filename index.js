let http = require('http');
let express = require('express');
let request = require('request');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let seedDB = require("./seeds");
let Topic = require("./models/topic");
let Registration = require("./models/registration");
let MessageFormatter = require("./message-formatter");
let RegistrationController = require("./controllers/registration-controller");
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
seedDB();

const PORT = 3131;

app.listen(PORT, () => {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Coach Finder listening on port " + PORT);
});

// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
app.get('/oauth', (req, res) => {
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
        }, (error, response, body) => {
            if (error) {
                console.log(error);
            } else {
                res.json(body);
            }
        });
    }
});

app.post('/coach', (req, res) => {
    let slots = extractTotalSlots(req.body.text);
    let newTopic = {
        coachSlackId: req.body.user_id,
        coachUsername: req.body.user_name,
        topicTitle: extractTitle(req.body.text),
        totalSlots: slots,
        availableSlots: slots
    };

    dataAccess.insert(Topic, newTopic, (result) =>{
        if (!result) {
            console.log(error);
        } else {
            console.log("Topic created");
            res.send(MessageFormatter.formatSuccessMessage(result));
        }
    });
});

app.post('/learn', (req, res) => {
    let topicToLearn = req.body.text;
    let userId = req.body.user_id;

    if (topicToLearn.toLowerCase() === "everything") {
        dataAccess.findTopic({}, (foundTopics) => {
            if (!foundTopics) {
                console.log(error);
            } else {
                MessageFormatter.formatTopicList(foundTopics, userId, (textToSendBack) => {
                    res.send(textToSendBack);
                });
            }
        });
    } else {
        let query = Topic.find({
            topicTitle: topicToLearn
        });
        query.exec((err, foundTopics) => {
            if (err) {
                return console.log(err);
            } else {
                let textToSendBack = "";
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

app.get('/participants/:id', (req, res) => {
    let requestedTopicId = mongoose.Types.ObjectId(req.params.id);
    let topicTitle;

    dataAccess.findById(Topic, requestedTopicId, (foundTopic) => {
        if (!foundTopic) {
            console.log(error);
            res.status(404).send('Not found');
        } else {
            dataAccess.findRegistrationByTopicId({topicId: requestedTopicId}, (registeredParticipants) => {
                if (!registeredParticipants) {
                    console.log(error);
                    res.status(404).send('Not found');
                } else {
                    res.render('registrations/show', {participants:registeredParticipants, topic: foundTopic});
                }
            });
        }
    });
});

app.post('/registration', (req, res) => {
    let payload = JSON.parse(req.body.payload);
    let topicId = payload.actions[0].value;
    let user = payload.user;
    
    dataAccess.findById(Topic, topicId, (foundTopic) => {
        dataAccess.isUserRegisteredOnTopic(user.id, topicId, (isAlreadyRegistered) => {
            if (isAlreadyRegistered) {
                RegistrationController.deleteRegistration(topicId, user, foundTopic, (successDropOutMessage) => {
                    res.send(successDropOutMessage);
                });
            } else {
                if (foundTopic.availableSlots > 0) {
                    RegistrationController.createRegistration(foundTopic, user, topicId, (successRegistrationMessage) => {
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

