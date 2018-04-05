let dataAccess = require("./../data-manager/data-access");
let Registration = require("./../models/registration");
let Topic = require("./../models/topic");
let MessageFormatter = require("./../message-formatter");

class RegistrationController {
    static deleteRegistration(topicId, user, callback) {
        dataAccess.findById(Topic, topicId, (foundTopic) => {
            let registrationToDelete = { topicId: topicId, applicantSlackId: user.id };
            dataAccess.delete(Registration, registrationToDelete, (isDeleted) => {
                if (isDeleted) {
                    foundTopic.availableSlots = foundTopic.availableSlots + 1;
                    foundTopic.save();
                    console.log("unregistered successfully");
                    let successMessage = MessageFormatter.formatSuccessDropOutMessage(foundTopic.topicTitle, user.name);
                    callback(successMessage);
                } else {
                    console.log("an error happened while trying to delete registration");
                }
            })
        });

    }
    
    static createRegistration(user, topicId, callback) {
        dataAccess.findById(Topic, topicId, (foundTopic) => {
            if (foundTopic.availableSlots > 0) {
                let newRegistration = {
                    applicantSlackId: user.id,
                    applicantUsername: user.name,
                    topicId: topicId
                };
                foundTopic.availableSlots = foundTopic.availableSlots - 1;
                foundTopic.save();
                dataAccess.insert(Registration, newRegistration, (createdRegistration) => {
                    if (createdRegistration) {
                        let successMessage = MessageFormatter.formatSuccessRegistrationMessage(foundTopic.topicTitle, createdRegistration.applicantUsername);
                        callback(successMessage);
                    } else {
                        console.log("Failed to create registration");
                    }
                })
            } else {
                callback(MessageFormatter.formatErrorRegistrationMessage());
            }
        });
    }

    static isUserRegisteredOnTopic(topicId, userId, callback){
        dataAccess.isUserRegisteredOnTopic(userId, topicId, (isAlreadyRegistered) => {
            callback(isAlreadyRegistered);
        });
    }

}
module.exports = RegistrationController;
