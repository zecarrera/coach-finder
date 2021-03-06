let dataAccess = require("./data-manager/data-access");

class MessageFormatter {
    static formatSuccessMessage(addedTopic){
        return {
        "attachments": [
            {
                "title": "WOW, Nice job!",
                "pretext": "Coach topics _updated_",
                "color": "good",
                "text": `<@${addedTopic.coachSlackId}> is now listed as coach for *${addedTopic.topicTitle}* with *${addedTopic.totalSlots}* slots`
            }
        ]
        };
    }

    static formatSuccessRegistrationMessage(topicTitle, applicantUsername){
        return {
        "attachments": [
            {
                "title": "Welcome!",
                "color": "good",
                "text": `<@${applicantUsername}> is now registered to attend *${topicTitle}*`
            }
        ]
        };
    }

    static formatSuccessDropOutMessage(topicTitle, applicantUsername){
        return {
        "attachments": [
            {
                "title": "Sorry, to see you go!",
                "color": "good",
                "text": `<@${applicantUsername}> is no longer attending *${topicTitle}*`
            }
        ]
        };
    }

    static formatErrorRegistrationMessage () {
        return {
        "attachments": [
            {
                "title": "Sorry, registration failed!",
                "color": "danger",
                "text": "send /learn everything to see full list"
            }
        ]
        };
    }

    static unknownErrorMessage() {
        return {
            "attachments": [
                {
                    "title": "Sorry, somethign went wrong!",
                    "color": "danger",
                    "text": "Please, try again!"
                }
            ]
        };
    }

    static formatTopicList (listOfTopicsToPresent, userId, callback) {
        let messageAttachments = [];
        let attachment;
        listOfTopicsToPresent.forEach(topic => {
            dataAccess.isUserRegisteredOnTopic(userId, topic._id, function(isRegistered){
                if(isRegistered){
                    attachment =
                    {
                        "title": topic.topicTitle,
                        "text": "*coach:* "+"<@" + topic.coachUsername + ">"+ " \n*available slots:* "+topic.availableSlots,
                        "title_link": "https://testcoachfinder.localtunnel.me/participants/"+topic._id,
                        "callback_id": "toggle_registration",
                        "color": "good",
                        "actions":[
                            {
                                "name": "toggle-registration",
                                "text": "Drop-out",
                                "type": "button",
                                "value": topic._id
                            }
                        ]
                    };
                }else{
                    if(topic.availableSlots > 0){
                        attachment =
                        {
                            "title": topic.topicTitle,
                            "text": "*coach:* "+"<@" + topic.coachUsername + ">"+ " \n*available slots:* "+topic.availableSlots,
                            "title_link": "https://testcoachfinder.localtunnel.me/participants/"+topic._id,
                            "callback_id": "toggle_registration",
                            "color": "good",
                            "actions":[
                                {
                                    "name": "toggle-registration",
                                    "text": "Join",
                                    "type": "button",
                                    "value": topic._id
                                }
                            ]
                        };
                    }else{
                        attachment =
                        {
                            "title": topic.topicTitle,
                            "text": "*coach:* "+"<@" + topic.coachUsername + ">"+ " \n*available slots:* "+topic.availableSlots,
                            "title_link": "https://testcoachfinder.localtunnel.me/participants/"+topic._id,
                            "callback_id": "toggle_registration",
                            "color": "bad"
                        };
                    }
                }
                messageAttachments.push(attachment);
                if(messageAttachments.length === listOfTopicsToPresent.length){
                    let fullMessage= {
                        "text": "Full List of Topics \n _click link to view details_",
                        "attachments": messageAttachments
                    };
                    callback(fullMessage);
                }
            });
        });
    }

    static topicNotFound (callback) {
        let message= {
        "attachments": [
            {
                "title": "Topic not found",
                "color": "warning",
                "text": "send /learn everything to see full list"
            }
        ]
        };
        callback(message);
    }
}

module.exports = MessageFormatter;
