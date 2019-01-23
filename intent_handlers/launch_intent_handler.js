const DatabaseHelper = require('../helpers/database_helper.js');
const EventsIntentHandler = require('./events_intent_handler.js');
const AddressIntentHandler = require('./address_intent_handler.js');

require('./../constants.js');

const LaunchRequest = {
        canHandle(handlerInput) {
        console.log("Received Launch Request...");

        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },

    handle(handlerInput) {

        //Send a permission card to companion app for user to enable the permissions.
        const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;

        const consentToken = requestEnvelope.context.System.user.permissions
        && requestEnvelope.context.System.user.permissions.consentToken;

        console.log("Inside Launch Request...");
        if (!consentToken) {
            return responseBuilder
            .speak(messages.WELCOME)
            .withAskForPermissionsConsentCard(PERMISSIONS)
            .getResponse();
        }

        const userid = handlerInput.requestEnvelope.session.user.userId;
        console.log("User Id is : " + userid);

        return new Promise((resolve, reject) =>{
            DatabaseHelper.USERS_TABLE.find( userid ).then(function(user){

            if(user){

                //User exists. Checking for his stored address in DB...
                console.log("User exists. Check for his stored address in DB");

                if(user.lat && user.lng){

                console.log("Address is found in DB. Fetching events around him");
                resolve(EventsIntentHandler.EventsIntent.handle(handlerInput));

                }else{
                console.log("Address is not found in DB. Fetching user address first.");
                resolve(AddressIntentHandler.AddressIntent.handle(handlerInput));
                }

            }else{
                console.log("Error. User does not exist. Creating new user...");

                DatabaseHelper.USERS_TABLE.insert({ 'userid': userid })
                .then(function(resp){

                    console.log("User added in DB. Now fetching user address...");
                    resolve(AddressIntentHandler.AddressIntent.handle(handlerInput));
                });
            }
        });
      });
    }
}

module.exports.LaunchRequest = LaunchRequest;