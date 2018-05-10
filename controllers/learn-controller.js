let dataAccess = require("./../data-manager/data-access");
let Topic = require("./../models/topic");
let MessageFormatter = require("./../message-formatter");

class LearnController {
    static presentAllTopics(userId, callback) {
        dataAccess.findTopic({topicTitle: ""}, (foundTopics) => {
            if (!foundTopics) {
                console.log(error);
            } else {
                MessageFormatter.formatTopicList(foundTopics, userId, (textToSendBack) => {
                    callback(textToSendBack);
                });
            }
        });
    }
    static searchGivenTopic(topicToLearn, userId, callback) {
        dataAccess.findTopic(
            {
                topicTitle: topicToLearn
            }
            , (foundTopics) => {
                let textToSendBack = "";
                if (foundTopics.length > 0) {
                    MessageFormatter.formatTopicList(foundTopics, userId, (textToSendBack) => {
                        callback(textToSendBack);
                    });
                } else {
                    MessageFormatter.topicNotFound((textToSendBack) => {
                        callback(textToSendBack);

                    });
                }
            });
    }

}
module.exports = LearnController;
