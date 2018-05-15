let request = require("request");

let base_url = "https://testcoachfinder.localtunnel.me"

describe('When user clics join', () => {
    let foundTopics = [];
    defaultRegOptions = ()=> {
        return {
            method: 'POST',
            url: `${base_url}/registration`,
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded'
            },

            body: {
                payload:{
                    actions:
                    [{
                        name: 'toggle-registration',
                        type: 'button',
                        value: '5afb23f08016dcdc350c3481'
                    }],
                    callback_id: 'toggle_registration',
                    user: { id: '12345', name: 'test-user' }
                }
                
            }
        };
    };
    describe('and there are available slots', () => {
        beforeEach((done)=>{
            foundTopics = [];
            request(defaultRegOptions(), (error, response) => {
                if (error) throw new Error(error);
                let slackMessage = JSON.parse(response.body);
                foundTopics = slackMessage.attachments;
                done();
            });
        });

        it("then registred successfully message is received", () => {
            expect(foundTopics.filter(topic => topic.title == "thing 1").length).toBe(1);
            expect(foundTopics.filter(topic => topic.title == "thing 2").length).toBe(1);
            expect(foundTopics.filter(topic => topic.title == "thing 3").length).toBe(1);            
        });
    });

    
});
