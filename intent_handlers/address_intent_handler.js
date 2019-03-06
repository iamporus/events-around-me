const LocationHelper = require('../helpers/location_helper');
const DatabaseHelper = require('../helpers/database_helper');
const DefaultIntents = require('../index')
const Utils = require('./../helpers/utils')

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

                                let response = getResponseForAddress(handlerInput, userid, user_address, address.postalCode);
                                resolve(response);
                            });

                        } else {

                            let response = getResponseForAddress(handlerInput, userid, user_address, address.postalCode);
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

        var lat = user_address.results[0].geometry.location.lat;
        var lng = user_address.results[0].geometry.location.lng;
        var address_components = user_address.results[0].address_components;
        var cityName = address_components[0].long_name;
        var country = address_components[address_components.length - 1].short_name;

        DatabaseHelper.saveUserAddress(userid, lat, lng, cityName, address.postalCode, country);

        addUserInAttributes(user_address, userid, handlerInput);

        return handlerInput.responseBuilder
            .speak("Hello again. Here is what I found about you. You live in " + user_address.results[0].formatted_address +
                ". Do you want me to look for events around this address?")
            .reprompt("Do you want me to look for events around you?")
            .getResponse();
    }else{
        return handlerInput.responseBuilder
            .speak("Hello. Sorry, but I couldn't find where you live. Please try again.")
            .getResponse();
    }
}

function addUserInAttributes(user_address, userid, handlerInput){
    var lng = user_address.results[0].geometry.location.lng;
    var lat = user_address.results[0].geometry.location.lat;
    var address_components = user_address.results[0].address_components;
    var cityName = address_components[0].long_name;
    var country = address_components[address_components.length - 1].short_name;

    console.log("Creating User attribute.. ");

    let user = {
        'userid': userid,
        'lat': lat,
        'lng': lng,
        'city': cityName,
        'country': country
    };

    console.log("User attribute: " + JSON.stringify(user));

    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.user = user;
    handlerInput.attributesManager.setSessionAttributes(attributes);
}

const GetCityNameIntent = {
    canHandle(handlerInput) {
        const {
            request
        } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'GetCityNameIntent';
    },
    async handle(handlerInput) {

        const { request } = handlerInput.requestEnvelope;

        if(request.intent && request.intent.slots && request.intent.slots.city_name
            && typeof request.intent.slots.city_name.value !== 'undefined' && request.intent.slots.city_name.value){

            let slots = request.intent.slots;

            let city_name = slots.city_name.value;
            console.log("Got this city from user..."+ city_name);
            //This is a hack for addressing issue where user says no to any action and Alexa cloud considers it as GetCityNameIntent
            if(city_name === 'no' || city_name === 'nope' || city_name === 'nõo' || city_name === 'nowe' || city_name === 'now' || city_name === 'noo'){
                console.log("False Intent... Redirecting to NoIntent..." );
                return DefaultIntents.NoIntent.handle(handlerInput);
            }

            const attributes = handlerInput.attributesManager.getSessionAttributes();
            attributes.action_to_perform = ActionToPerform.CONFIRM_NEW_CITY;

            var counter = attributes.city_input_counter;
            if(typeof counter ==='undefined'){
                //TODO: use counter to terminate this city lookup madness
                counter = 0;
            }

            const userid = handlerInput.requestEnvelope.session.user.userId;
            const user_address = await LocationHelper.getLatLongFromAddress(encodeURIComponent(city_name));

            if(user_address.results.length > 0){
                var response = user_address.results[0].formatted_address;

                var speech = new Speech();
                speech.say(Utils.randomize(cityConfirm));
                speech.say(response + '?');
                var speechOutput = speech.ssml(true);

                // create session attribute for user
                addUserInAttributes(user_address, userid, handlerInput);

                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt(speechOutput)
                    .getResponse();
            }else{
                return handlerInput.responseBuilder
                    .speak('Uh oh. I could not find the city named ' + city_name + '. '+ messages.REPEAT_CITY_NAME_RE)
                    .reprompt(messages.REPEAT_CITY_NAME_RE)
                    .getResponse();
            }
        }
    },
};


module.exports.AddressIntent = AddressIntent;
module.exports.GetCityNameIntent = GetCityNameIntent;