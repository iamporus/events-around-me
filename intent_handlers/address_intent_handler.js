
const LocationHelper = require('../helpers/location_helper');
const DatabaseHelper = require('../helpers/database_helper.js');
require('../constants.js');

const AddressIntent = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'GetAddressIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;

        const consentToken = requestEnvelope.context.System.user.permissions
        && requestEnvelope.context.System.user.permissions.consentToken;
        if (!consentToken) {
        return responseBuilder
            .speak(messages.NOTIFY_MISSING_PERMISSIONS)
            .withAskForPermissionsConsentCard(PERMISSIONS)
            .getResponse();
        }
        try {
            const { deviceId } = requestEnvelope.context.System.device;
            const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
            const address = await deviceAddressServiceClient.getCountryAndPostalCode(deviceId);
            const userid = handlerInput.requestEnvelope.session.user.userId;

            console.log('Address successfully retrieved, now responding to user.');

            if (address.addressLine1 === null && address.stateOrRegion === null) {
                response = responseBuilder.speak(messages.NO_ADDRESS).getResponse();
            } else {

                console.log("Pincode: " + address.postalCode);
                const user_address = await LocationHelper.getLatLongFromPostalCode(address.postalCode);
                console.log("Here is the complete address: "+ user_address);

                return new Promise((resolve, reject) =>{
                    DatabaseHelper.USERS_TABLE.find( userid ).then(function(user){
                        if(!user){
                            console.log("Error. User does not exist. ");
                            console.log("Creating new user...");

                            DatabaseHelper.USERS_TABLE.insert({ 'userid': userid }).then(function(resp){

                                DatabaseHelper.saveUserAddress(userid, user_address, address.postalCode);

                                let response = handlerInput.responseBuilder
                                .speak("Okay. Here is what I found about you. You live in " + user_address.results[0].formatted_address +
                                ". Do you want me to look for events around this address?")
                                .reprompt("Do you want me to look for events around you?")
                                .getResponse();
                                resolve(response);
                            });
                        }else{
                            DatabaseHelper.saveUserAddress(userid, user_address, address.postalCode)

                            let response = handlerInput.responseBuilder
                            .speak("Okay. Here is what I found about you. You live in " + user_address.results[0].formatted_address +
                            ". Do you want me to look for events around you?")
                            .reprompt("Do you want me to look for events around you?")
                            .getResponse();;
                            resolve(response);
                        }

                    });
                });
            }

        } catch (error) {
        if (error.name !== 'ServiceError') {
            const response = responseBuilder.speak(messages.ERROR).getResponse();
            return response;
        }
        throw error;
        }
    },
};

const AddressError = {
    canHandle(handlerInput, error) {
      return error.name === 'ServiceError';
    },
    handle(handlerInput, error) {
      if (error.statusCode === 403) {
        return handlerInput.responseBuilder
          .speak(messages.NOTIFY_MISSING_PERMISSIONS)
          .withAskForPermissionsConsentCard(PERMISSIONS)
          .getResponse();
      }
      return handlerInput.responseBuilder
        .speak(messages.LOCATION_FAILURE)
        .reprompt(messages.LOCATION_FAILURE)
        .getResponse();
    },
};

module.exports.AddressIntent = AddressIntent;
module.exports.AddressError = AddressError;