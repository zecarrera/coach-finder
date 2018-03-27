let Registration = require("./../models/registration");
let Topic = require("./../models/topic");

module.exports.isUserRegisteredOnTopic = (applicantSlackId, topicId, next) => {
    let object = { topicId: topicId, applicantSlackId: applicantSlackId};
    Registration.find(object, (error, foundRegistration) => {
        if (error) {
            console.log(error);
        } else {
            if(foundRegistration.length === 1){
                next(true);
            }else{
                next(false);
            }
        }
    });
};

module.exports.delete = (model, objectToDelete, next) => {
    model.remove(objectToDelete, function (error) {
        if (error) {
            console.log(error);
            next(false);
        }else{
            next(true);
        }
    });
};

module.exports.insert = (model, objectToInsert, next) => {
    model.create(objectToInsert, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            console.log("registered successfully");
        }
        next(result);
    });
};

module.exports.findById = (model, objectId, next) => {
    model.findById(objectId, function (error, foundEntry) {
        if(error){
            console.log(error);
        }else{
            next(foundEntry);
        }
    });
};

module.exports.findRegistrationByTopicId = (searchTopic, next) => {
    Registration.find(searchTopic, function (error, registeredParticipants) {
        if (error) {
            console.log(error);
        } else {
            next(registeredParticipants);
        }
    });
};