let Registration = require("./../models/registration");
let Topic = require("./../models/topic");

module.exports.getTopicById = function (topicId, next) {
    Topic.findById(topicId, function (error, foundTopic) {
        if (error) {
            console.log(error);
        } else {
            return foundTopic;
        }
    });
};

module.exports.isUserRegisteredOnTopic = function (applicantSlackId, topicId, next) {
    let object = { topicId: topicId, applicantSlackId: applicantSlackId};
    Registration.find(object, function (error, foundRegistration) {
        if (error) {
            return false;
        } else {
            return true;
        }
    });
};