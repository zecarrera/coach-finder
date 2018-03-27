let dataAccess = require("./../data-manager/data-access");
let Registration = require("./../models/registration");
let MessageFormatter = require("./../message-formatter");

class RegistrationController {
    static deleteRegistration(topicId, user, foundTopic, callback) {
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
    }

    static createRegistration(foundTopic, user, topicId, callback) {
        let newRegistration = {
            applicantSlackId: user.id,
            applicantUsername: user.name,
            topicId: topicId
        };
        foundTopic.availableSlots = foundTopic.availableSlots - 1;
        foundTopic.save();
        // decrementAvailableSlots(foundTopic, () => {
            dataAccess.insert(Registration, newRegistration, (createdRegistration) => {
                if (createdRegistration) {
                    let successMessage = MessageFormatter.formatSuccessRegistrationMessage(foundTopic.topicTitle, createdRegistration.applicantUsername);
                    callback(successMessage);
                } else {
                    console.log("Failed to create registration");
                }
            })
        // });
    }

    // decrementAvailableSlots = (foundTopic, callback) =>{
    //     foundTopic.availableSlots = foundTopic.availableSlots - 1;
    //     foundTopic.save();
    //     callback();
    // }
}
module.exports = RegistrationController;
