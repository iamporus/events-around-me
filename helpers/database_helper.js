
var credentials = {
    accessKeyId: 'AKIAI423S3JQDTU5YH5Q',
    secretAccessKey: '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',
    region: 'ap-northeast-1'
  };

var dynasty = require('dynasty')(credentials);
var USERS_TABLE = dynasty.table('events_user_info');

function saveUserAddress(userid, lat, lng, city, postalCode, countrycode)
{
    USERS_TABLE.update( userid,{
        'lat':lat,
        'lng':lng,
        'city': city,
        'pincode':postalCode,
        'country':countrycode
    })
    .then(function(resp){
        console.log(resp);
        console.log("Saved address details in db successfully.");
    });
}

module.exports.USERS_TABLE = USERS_TABLE;
module.exports.saveUserAddress = saveUserAddress;