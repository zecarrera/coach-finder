var request = require("request");

var base_url = "https://testcoachfinder.localtunnel.me"

describe('When user sends /coach', () => {
    let serverResponse;
    defaultCoachOptions = (topicToCoach) => {
        return {
            method: 'POST',
            url: `${base_url}/coach`,
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                user_id: '999999',
                user_name: 'test-user',
                text: topicToCoach
            }
        };
    };
    describe('with message set to "new topic 1 with 10 slots"', () => {
        beforeEach((done) => {
            request(defaultCoachOptions("new topic 1 with 10 slots"), (error, response, body) => {
                if (error) throw new Error(error);
                let slackMessage = JSON.parse(response.body);
                serverResponse = slackMessage.attachments[0];
                done();
            });
        });

        it("then returns with username and topic to coach", () => {
            expect(serverResponse.text).toBe("<@999999> is now listed as coach for *new topic 1* with *10* slots");
        });
    });
});

    //TODO: post existing topic for user should not add repeated done
    // post existing topic different user, should not be allowed
    // reject topic if slots are not provided or valid
