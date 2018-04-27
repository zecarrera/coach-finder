let request = require("request");

let base_url = "https://testcoachfinder.localtunnel.me"

describe('When user sends /learn', () => {
    let foundTopics = [];
    defaultOptions = (searchTopic)=> {
        return {
            method: 'POST',
            url: `${base_url}/learn`,
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                user_id: '12345',
                user_name: 'test-user',
                text: searchTopic
            }
        };
    };
    describe('with message set to "everything"', () => {
        beforeEach((done)=>{
            foundTopics = [];
            request(defaultOptions("everything"), (error, response) => {
                if (error) throw new Error(error);
                let slackMessage = JSON.parse(response.body);
                foundTopics = slackMessage.attachments;
                done();
            });
        });

        it("then returns all topics previously registered", () => {
            expect(foundTopics.filter(topic => topic.title == "thing 1").length).toBe(1);
            expect(foundTopics.filter(topic => topic.title == "thing 2").length).toBe(1);
            expect(foundTopics.filter(topic => topic.title == "thing 3").length).toBe(1);            
        });
    });

    describe('with message set to "thing 1"', () => {
        beforeEach((done) => {
            foundTopics = [];
            request(defaultOptions("thing 1"), (error, response) => {
                if (error) throw new Error(error);
                let slackMessage = JSON.parse(response.body);
                foundTopics = slackMessage.attachments;
                
                done();
            });
        });

        it("then returns only matches 1 topic", () => {
            expect(foundTopics.length).toBe(1);
            expect(foundTopics[0].title).toBe("thing 1");
        });
    });

    describe('with message set to "not existent"', () => {
        beforeEach((done) => {
            foundTopics = [];
            request(defaultOptions("not existent"), (error, response) => {
                if (error) throw new Error(error);
                let slackMessage = JSON.parse(response.body);
                foundTopics = slackMessage.attachments;

                done();
            });
        });

        it("then returns topic not found message", () => {
            expect(foundTopics[0].title.indexOf('Topic not found') !== -1).toBe(true);
            expect(foundTopics[0].text.indexOf('send /learn everything to see full list') !== -1).toBe(true);
            expect(foundTopics.length).toBe(1);
        });
    });

//TODO: tests to add
// search for "thing" should bring all topics with "thing" (https://stackoverflow.com/questions/9824010/mongoose-js-find-user-by-username-like-value)

//registration spec:
// don't show join button if no slots are availableSlots
// show button with different text depending if registered or not
});
