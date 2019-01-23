var https = require('https');

function getLatLongFromPostalCode(postalCode) {
    return new Promise(((resolve, reject) => {
      var options = {
          host: 'maps.googleapis.com',
          port: 443,
          path: '/maps/api/geocode/json?address='+postalCode+'&key=AIzaSyDRotqxlPDufHEJJzVaLxswP6uS71hCr5c',
          method: 'GET',
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

  module.exports.getLatLongFromPostalCode = getLatLongFromPostalCode;