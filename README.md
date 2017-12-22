# coach-finder
- Running locally
1. Download ngrok
2. Run ngrok with desired port to create a tunnel ./ngrok http 3131
3. Point all slack app urls to the tunnel created by ngrok

-Start server
npm start (starts local server, runs seeds.js to set up test data on mongo)

-Run tests
npm test


## Basic usage
- /coach [topic]
Adds user to topic list as a coach for a given topic

- /learn [topic]
Returns a list of coaches for the given topics. If topic is not found full list is returned.
