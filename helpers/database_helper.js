
var credentials = {
    accessKeyId: 'AKIAI423S3JQDTU5YH5Q',
    secretAccessKey: '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',
    region: 'ap-northeast-1'
  };

var dynasty = require('dynasty')(credentials);
var USERS_TABLE = dynasty.table('events_user_info');

function saveUserAddress(userid, userAddress, postalCode, countrycode)
{
    var lat = userAddress.results[0].geometry.location.lat;
    var lng = userAddress.results[0].geometry.location.lng;

    console.log("lat: "  + lat);
    console.log("lng: "  + lng);

    USERS_TABLE.update( userid,{
        'pincode':postalCode,
        'lat':lat,
        'lng':lng,
        'country':countrycode
    })
    .then(function(resp){
        console.log(resp);
        console.log("Saved address details in db successfully.");
    });
}

module.exports.USERS_TABLE = USERS_TABLE;
module.exports.saveUserAddress = saveUserAddress;