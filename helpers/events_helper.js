var https = require('https');

function getEventsAroundUser(lat, lng, country, categories, startDate, endDate) {
    return new Promise(((resolve, reject) => {

        let pathVal = '/v1/events/?'
        +'location_around.origin='+ lat +','+ lng
        +'&country=' + country
        +'&category=' + categories
        +'&start.gte=' + startDate
        +'&start.lte=' + endDate
        +'&within=200km@' + lat +','+ lng;

        console.log(pathVal);

        var options = {
                host: 'api.predicthq.com',
                port: 443,
                path: pathVal,
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
function getAParticularEvent(lat, lng, eventName, country, categories ) {
    return new Promise(((resolve, reject) => {

        let pathVal = '/v1/events/?'
        +'location_around.origin='+ lat +','+ lng
        +'&q='+ eventName
        +'&country=' + country
        +'&category=' + categories
        +'&within=200km@' + lat +','+ lng;

        console.log(pathVal);

        var options = {
                host: 'api.predicthq.com',
                port: 443,
                path: pathVal,
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
module.exports.getAParticularEvent = getAParticularEvent;