var request = require("request");

var base_url = "https://coachfindertest.localtunnel.me"

describe('When calling server with POST /learn', () => {
    describe('with topic set to "everything"', () => {
        it("then returns all topics previously registered", function(done) {
            var options = {
                method: 'POST',
                url: `${base_url}/learn`,
                headers: {
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded'
                },
                form: {
                    user_id: '12345',
                    user_name: 'test-user',
                    text: 'everything'
                }
            };

            request(options, function(error, response, body) {
                if (error) throw new Error(error);
                var slackMessage = JSON.parse(response.body);
                expect(slackMessage.attachments[0].title.indexOf('thing 1') !== -1).toBe(true);
                expect(slackMessage.attachments[0].text.indexOf('10') !== -1).toBe(true);
                expect(slackMessage.attachments[1].title.indexOf('thing 2') !== -1).toBe(true);
                expect(slackMessage.attachments[1].text.indexOf('11') !== -1).toBe(true);
                expect(slackMessage.attachments[2].title.indexOf('thing 3') !== -1).toBe(true);
                expect(slackMessage.attachments[2].text.indexOf('12') !== -1).toBe(true);

                done();
            });
        });
    });

    describe('with topic set to "thing 1"', () => {
        it("then returns only matches 1 topic", function(done) {
            var options = {
                method: 'POST',
                url: `${base_url}/learn`,
                headers: {
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded'
                },
                form: {
                    user_id: '12345',
                    user_name: 'test-user',
                    text: 'thing 1'
                }
            };

            request(options, function(error, response, body) {
                if (error) throw new Error(error);
                var slackMessage = JSON.parse(response.body);
                expect(slackMessage.attachments[0].title.indexOf('thing 1') !== -1).toBe(true);
                expect(slackMessage.attachments[0].text.indexOf('coachone') !== -1).toBe(true);
                expect(slackMessage.attachments[0].text.indexOf('10') !== -1).toBe(true);
                expect(slackMessage.attachments.length).toBe(1);
                done();
            });
        });
    });

    describe('with topic set to "not existent"', () => {
        it("then returns topic not found message", function(done) {
            var options = {
                method: 'POST',
                url: `${base_url}/learn`,
                headers: {
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded'
                },
                form: {
                    user_id: '12345',
                    user_name: 'test-user',
                    text: 'not existent'
                }
            };

            request(options, function(error, response, body) {
                if (error) throw new Error(error);
                var slackMessage = JSON.parse(response.body);
                console.log("message-->"+JSON.stringify(slackMessage));
                expect(slackMessage.attachments[0].title.indexOf('Topic not found') !== -1).toBe(true);
                expect(slackMessage.attachments[0].text.indexOf('send /learn everything to see full list') !== -1).toBe(true);
                expect(slackMessage.attachments.length).toBe(1);
                done();
            });
        });
    });

//TODO: tests to add
// search for "thing" should bring all topics with "thing" (https://stackoverflow.com/questions/9824010/mongoose-js-find-user-by-username-like-value)
// test with longer list of results to see how it is displayed
//registration spec:
// don't show join button if no slots are availableSlots
// show button with different text depending if registered or not
//
//need something to list who is registered
// need something to cancel registration
});
