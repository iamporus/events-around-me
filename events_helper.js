var https = require('https');

function getEventsAroundUser(lat, lng) {
    return new Promise(((resolve, reject) => {

        var options = {
                host: 'api.predicthq.com',
                port: 443,
                path: '/v1/events/?location_around.origin=18.5580,73.8075&category=concerts,sports',
                method: 'GET',
                headers: { "Authorization": "Bearer NOt8cFbjsbe2BvQI7Ax93N1tbBHJk0" }
        };

        const request = https.request(options, (response) => {
            response.setEncoding('utf8');
            let returnData = '';

            response.on('data', (chunk) => {
                returnData += chunk;
            });

            response.on('end', () => {
                resolve(JSON.parse(returnData));
            });

            response.on('error', (error) => {
                reject(error);
            });
        });

        request.end();
}));
}

module.exports.getEventsAroundUser = getEventsAroundUser;