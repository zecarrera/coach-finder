let dataAccess = require("./../data-manager/data-access");
let Topic = require("./../models/topic");

class ParticipantsController {
    static findRegisteredParticipants(requestedTopicId, callback) {
        dataAccess.findById(Topic, requestedTopicId, (foundTopic) => {
            if (!foundTopic) {
                console.log(error);
                callback(true);
            } else {
                dataAccess.findRegistrationByTopicId({ topicId: requestedTopicId }, (registeredParticipants) => {
                    if (!registeredParticipants) {
                        console.log(error);
                        callback(true);
                    } else {
                        callback(false, registeredParticipants, foundTopic);
                    }
                });
            }
        });
    }
}
module.exports = ParticipantsController;
