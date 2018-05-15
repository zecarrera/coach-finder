var mongoose = require('mongoose');

var registrationSchema = new mongoose.Schema({
    applicantSlackId: String,
    applicantUsername: String,
    time: { type: Date, default: Date.now },
    topicId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic"
    }
});

module.exports = mongoose.model("Registration", registrationSchema);
