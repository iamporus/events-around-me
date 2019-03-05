
var credentials = {
    accessKeyId: 'AKIAI423S3JQDTU5YH5Q',
    secretAccessKey: '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',
    region: 'ap-northeast-1'
  };

var dynasty = require('dynasty')(credentials);
var USERS_TABLE = dynasty.table('events_user_info');

function saveUserAddress(userid, lat, lng, city, postalCode, countrycode)
{
    USERS_TABLE.find(userid).then(function (user) {

        console.log('Attempting to save user city in DB.. ' + JSON.stringify(user));
        if (user && typeof user.city === 'undefined') {
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
        else{
        console.log('Default city already exist in DB.. ' + user.city);

        }
    });
}

module.exports.USERS_TABLE = USERS_TABLE;
module.exports.saveUserAddress = saveUserAddress;