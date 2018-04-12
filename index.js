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
let CoachController = require("./controllers/coach-controller");
let LearnController = require("./controllers/learn-controller");
let ParticipantsController = require("./controllers/participants-controller");
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
            url: 'https://slack.com/api/oauth.access',
            qs: {
                code: req.query.code,
                client_id: clientId,
                client_secret: clientSecret
            },
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
    let newTopic = {
        coachSlackId: req.body.user_id,
        coachUsername: req.body.user_name,
        topicTitle: extractTitle(req.body.text),
        totalSlots: extractTotalSlots(req.body.text),
        availableSlots: slots
    };
    CoachController.addTopic(newTopic, (coachTopicConfirmationMessage) =>{
        res.send(coachTopicConfirmationMessage);
    });
});

app.post('/learn', (req, res) => {
    let topicToLearn = req.body.text;
    let userId = req.body.user_id;

    if (topicToLearn.toLowerCase() === "everything") {
        LearnController.presentAllTopics(userId, (topicListToPresent) => {
            res.send(topicListToPresent);
        });
    } else {
        LearnController.searchGivenTopic(topicToLearn, userId, (topicListToPresent) => {
            res.send(topicListToPresent);
        });
    }
});

app.get('/participants/:id', (req, res) => {
    let requestedTopicId = mongoose.Types.ObjectId(req.params.id);
    let topicTitle;

    ParticipantsController.findRegisteredParticipants(requestedTopicId, (hasError, registeredParticipants, foundTopic)=>{
        if(hasError){
            res.status(404).send('Not found');
        }else{
            res.render('registrations/show', { participants: registeredParticipants, topic: foundTopic });            
        }
    });
    
});

app.post('/registration', (req, res) => {
    let payload = JSON.parse(req.body.payload);
    let topicId = payload.actions[0].value;
    let user = payload.user;

    RegistrationController.isUserRegisteredOnTopic(topicId, user.id, (isAlreadyRegistered) => {
        if (isAlreadyRegistered) {
            RegistrationController.deleteRegistration(topicId, user, (successDropOutMessage) => {
                res.send(successDropOutMessage);
            });
        } else {
            RegistrationController.createRegistration(user, topicId, (registrationMessage) => {
                res.send(registrationMessage);
            });
        }
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

