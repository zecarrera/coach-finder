class MessageFormatter {
    static formatSuccessMessage(addedTopic){
        return {
        "attachments": [
            {
                "title": "WOW, Nice job!",
                "pretext": "Coach topics _updated_",
                "color": "good",
                "text": `<@${addedTopic.coachSlackId}> is now listed as coach for *${addedTopic.topicTitle}*`,
                "mrkdwn_in": [
                    "text",
                    "pretext"
                ]
            }
        ]
        };
    }

    static formatTopicList (textToFormat) {
        return {
        "attachments": [
            {
                "title": "Full List of Topics",
                "color": "good",
                "text": `${textToFormat}`,
                "mrkdwn_in": [
                    "text",
                    "pretext"
                ]
            }
        ]
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
