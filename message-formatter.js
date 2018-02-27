class MessageFormatter {
    static formatSuccessMessage(addedTopic){
        return {
        "attachments": [
            {
                "title": "WOW, Nice job!",
                "pretext": "Coach topics _updated_",
                "color": "good",
                "text": `<@${addedTopic.coachSlackId}> is now listed as coach for *${addedTopic.topicTitle}* with *${addedTopic.totalSlots}* slots`,
                "mrkdwn_in": [
                    "text",
                    "pretext"
                ]
            }
        ]
        };
    }

    static formatTopicList (listOfTopicsToPresent) {
        let messageAttachments = [];
        listOfTopicsToPresent.forEach(topic => {
            let attachment = { "title": topic.topicTitle, "text": "coach: "+"<@" + topic.coachUsername + ">"+ " slots: "+topic.totalSlots, "title_link": "http://www.test.com", "color": "good"};
            messageAttachments.push(attachment)
        });
        return {
            "text": "Full List of Topics \n _click link to subscribe_",
            "attachments": messageAttachments
        };
    }

    static topicNotFound () {
        return {
        "attachments": [
            {
                "title": "Topic not found",
                "color": "bad",
                "text": "send /learn everything to see full list",
                "mrkdwn_in": [
                    "text",
                    "pretext"
                ]
            }
        ]
        };
    }
}

module.exports = MessageFormatter;
