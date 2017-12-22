var mongoose = require('mongoose');

var topicSchema = new mongoose.Schema({
    coachSlackId: String,
    coachUsername: String,
    topicTitle: String
});

module.exports = mongoose.model("Topic", topicSchema);
