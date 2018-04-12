let dataAccess = require("./../data-manager/data-access");
let Topic = require("./../models/topic");
let MessageFormatter = require("./../message-formatter");

class CoachController {
    static addTopic(newTopic, callback) {
        dataAccess.insert(Topic, newTopic, (addedTopic) => {
            if (!addedTopic) {
                callback(MessageFormatter.unknownErrorMessage());
            } else {
                callback(MessageFormatter.formatSuccessMessage(addedTopic));
            }
        });
    }

}
module.exports = CoachController;
