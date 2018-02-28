var mongoose = require('mongoose');

var registrationSchema = new mongoose.Schema({
    applicantSlackId: String,
    applicantUsername: String,
    topicId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic"
    }
});

module.exports = mongoose.model("Registration", registrationSchema);
