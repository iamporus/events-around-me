const LocationHelper = require('../helpers/location_helper');
const DatabaseHelper = require('../helpers/database_helper');
require('../constants.js');
var Speech = require('ssml-builder');

const AddressIntent = {
    canHandle(handlerInput) {
        const {
            request
        } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'GetAddressIntent';
    },
    async handle(handlerInput) {
        const {
            requestEnvelope,
            serviceClientFactory,
            responseBuilder
        } = handlerInput;

        const consentToken = requestEnvelope.context.System.user.permissions &&
            requestEnvelope.context.System.user.permissions.consentToken;
        if (!consentToken) {
            return responseBuilder
                .speak(messages.NOTIFY_MISSING_PERMISSIONS)
                .withAskForPermissionsConsentCard(PERMISSIONS)
                .getResponse();
        }
        try {
            const {
                deviceId
            } = requestEnvelope.context.System.device;
            const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
            const address = await deviceAddressServiceClient.getCountryAndPostalCode(deviceId);
            const userid = handlerInput.requestEnvelope.session.user.userId;

            console.log('Address successfully retrieved, now responding to user.');

            if (address.addressLine1 === null && address.stateOrRegion === null) {
                response = responseBuilder.speak(messages.NO_ADDRESS).getResponse();
            } else {

                console.log("Pincode: " + address.postalCode);
                const user_address = await LocationHelper.getLatLongFromAddress(address.postalCode);
                console.log("Here is the complete address: " + user_address);

                return new Promise((resolve, reject) => {
                    DatabaseHelper.USERS_TABLE.find(userid).then(function (user) {

                        if (!user) {

                            console.log("Error. User does not exist. ");
                            console.log("Creating new user...");

                            DatabaseHelper.USERS_TABLE.insert({
                                'userid': userid
                            }).then(function (resp) {

                                let response = getResponseForAddress(handlerInput, userid, user_address, address);
                                resolve(response);
                            });

                        } else {

                            let response = getResponseForAddress(handlerInput, userid, user_address, address);
                            resolve(response);
                        }

                    });
                });
            }

        } catch (error) {
            console.log(error);
            if (error.name !== 'ServiceError') {
                const response = responseBuilder.speak(messages.ERROR).getResponse();
                return response;
            }
            else{
                //looks like permission is not granted
                return handlerInput.responseBuilder
                    .speak(messages.NOTIFY_MISSING_PERMISSIONS)
                    .withAskForPermissionsConsentCard(PERMISSIONS)
                    .getResponse();
              }
        }
    },
};

function getResponseForAddress(handlerInput, userid, user_address, address) {
    if(user_address.results.length > 0){
        var lng = user_address.results[0].geometry.location.lng;
        var lat = user_address.results[0].geometry.location.lat;
        var address_components = user_address.results[0].address_components;
        var country = address_components[address_components.length - 1].short_name;

        DatabaseHelper.saveUserAddress(userid, user_address, address.postalCode, country);

        console.log("address_components length " + address_components.length);
        console.log("short name: " + address_components[address_components.length - 1].short_name);

        let user = {
            'userid': userid,
            'lat': lat,
            'lng': lng,
            'country': country
        };

        const attributes = handlerInput.attributesManager.getSessionAttributes();
        attributes.user = user;
        handlerInput.attributesManager.setSessionAttributes(attributes);

        return handlerInput.responseBuilder
            .speak("Hello again. Here is what I found about you. You live in " + user_address.results[0].formatted_address +
                ". Do you want me to look for events around this address?")
            .reprompt("Do you want me to look for events around you?")
            .getResponse();
    }else{
        return handlerInput.responseBuilder
            .speak("Hello again. I couldn't find where you live. Please try again.")
            .getResponse();
    }
}

const GetCityNameIntent = {
    canHandle(handlerInput) {
        const {
            request
        } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'GetCityNameIntent';
    },
    async handle(handlerInput) {
        const {
            requestEnvelope,
            serviceClientFactory,
            responseBuilder
        } = handlerInput;

        const { request } = handlerInput.requestEnvelope;

        if(request.intent && request.intent.slots && request.intent.slots.city_name
            && typeof request.intent.slots.city_name.value !== 'undefined' && request.intent.slots.city_name.value){

            let slots = request.intent.slots;

            //User wants to know about a particular event.
            let city_name = slots.city_name.value;
            console.log("Got this city from user..."+ city_name);

            const user_address = await LocationHelper.getLatLongFromAddress(city_name);
            if(user_address.results.length > 0){
                var response = user_address.results[0].formatted_address;

                var speech = new Speech();
                speech.say('So you live in ' + response);
                speech.pause('1s');
                speech.say('Is that right?');
                var speechOutput = speech.ssml(true);

                return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt('Do you live in ' + response +'?')
                .getResponse();
            }else{
                return handlerInput.responseBuilder
                .speak('Uh oh. I could not find the city ' + city_name +'. Please try again.')
                .reprompt('Uh oh. I could not find the city ' + city_name +'. Please try again.')
                .getResponse();
            }
        }
    },
};


module.exports.AddressIntent = AddressIntent;
module.exports.GetCityNameIntent = GetCityNameIntent;