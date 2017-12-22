var request = require("request");

var base_url = "http://12b62e46.ngrok.io"

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
                expect(slackMessage.attachments[0].text.indexOf('thing 1') !== -1).toBe(true);
                expect(slackMessage.attachments[0].text.indexOf('thing 2') !== -1).toBe(true);
                expect(slackMessage.attachments[0].text.indexOf('thing 3') !== -1).toBe(true);
                done();
            });
        });
    });

});
