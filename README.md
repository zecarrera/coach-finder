# coach-finder
- Running locally
1. `npm install -g localtunnel`
2. Start local tunnel `lt --port 3131 --subdomain testcoachfinder`
3. start local mongodb
4. `npm start` on the app

-Start server
`npm start` (starts local server, runs seeds.js to set up test data on mongo)

-Run tests
`npm test`


## Basic usage
- /coach [topic] with [number of slots] slots
Adds user to topic list as a coach for a given topic

- /learn [topic]
Returns a list of coaches for the given topics. If topic is not found full list is returned.
* /learn everything -> brings the full list of coach/topics
