var mongoose    = require('mongoose'),
    Topic       = require("./models/topic.js");

function seedDB() {
    console.log("Started to set up database");
    //Clear all topics
    Topic.remove({}, function(err) {
        if (err) {
            console.log(err);
        }
        data.forEach(function(seed) {
            Topic.create(seed, function(err, addedTopic) {
                if (err) {
                    console.log(err);
                } else {
                    addedTopic.save();
                }
            });
        });
    });

    //Insert some coach topics
    var data = [{
            coachSlackId: "12345",
            coachUsername: "coachone",
            topicTitle: "thing 1"
        },
        {
            coachSlackId: "67890",
            coachUsername: "coachtwo",
            topicTitle: "thing 2"
        },
        {
            coachSlackId: "54321",
            coachUsername: "coachthree",
            topicTitle: "thing 3"
        }
    ];

    console.log("Finished database setup");

}

module.exports = seedDB;
