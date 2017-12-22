var request = require("request");

var base_url = "http://12b62e46.ngrok.io"

describe('When calling server', () => {
    describe('with GET /', () => {
        it("then status 200 is returned", function (done) {

            request.get(base_url, function(error, response, body) {
                    expect(response.statusCode).toBe(200);
                    done();
                  });
        });

        it("and returns correct message", function (done) {
            request.get(base_url, function(error, response, body) {
                    expect(response.body).toBe("Ngrok is working! Path Hit: /");
                    done();
                  });
        });
    });

    describe('with POST /coach', () => {
        it("then returns with username and topic to coach", function (done) {
            var options = {
                method: 'POST',
                url: `${base_url}/coach`,
                headers:
                {
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded' },
                    form:
                    {
                        user_id: '999999',
                        user_name: 'test-user',
                        text: 'new topic 1'
                    }
                };

            request(options, function (error, response, body) {
              if (error) throw new Error(error);
              var slackMessage = JSON.parse(response.body);
              expect(slackMessage.attachments[0].text).toBe("<@999999> is now listed as coach for *new topic 1*");
              done();
            });
        });
    });
});
