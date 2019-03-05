const DatabaseHelper = require('../helpers/database_helper.js');
const EventsIntentHandler = require('./events_intent_handler.js');

require('./../constants.js');
const Speech = require('ssml-builder');

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

        return handleLaunchRequest(handlerInput);
    }
}

function handleLaunchRequest(handlerInput){
    return new Promise((resolve, reject) =>{

        const userid = handlerInput.requestEnvelope.session.user.userId;
        console.log("User Id is : " + userid);
        DatabaseHelper.USERS_TABLE.find( userid ).then(function(user){

        if(user){

            //User exists. Checking for his stored address in DB...
            console.log("User exists. Check for his stored address in DB");

            if(user.lat && user.lng){

                console.log("Address is found in DB. Fetching events around him");

                //Passing along user details in the session so as to skip fetching the details from db everytime.
                const attributes = handlerInput.attributesManager.getSessionAttributes();
                attributes.user = user;
                console.log(JSON.stringify(attributes.user));

                if(attributes.intent_to_cater){
                    if(attributes.intent_to_cater == 'DetailsEventIntent'){

                        handlerInput.attributesManager.setSessionAttributes(attributes);
                        resolve(EventsIntentHandler.DetailsEventIntent.handle(handlerInput));
                    }
                    else if(attributes.intent_to_cater == 'RandomEventIntent'){

                        handlerInput.attributesManager.setSessionAttributes(attributes);
                        resolve(EventsIntentHandler.RandomEventIntent.handle(handlerInput));
                    }
                    else if(attributes.intent_to_cater == 'GetEventByDateIntent'){

                        handlerInput.attributesManager.setSessionAttributes(attributes);
                        resolve(EventsIntentHandler.GetEventByDateIntent.handle(handlerInput));
                    }
                }else{
                    const attributes = handlerInput.attributesManager.getSessionAttributes();
                    attributes.action_to_perform = ActionToPerform.EVENT_LOOKUP_DEFAULT_CITY;

                    handlerInput.attributesManager.setSessionAttributes(attributes);

                    var speech = new Speech();
                    if(user.city && typeof user.city !== 'undefined'){
                        speech.say("Welcome to my events. Do you want me to look for upcoming events in " + user.city + "?");
                    }else{
                        speech.say("Welcome to my events. Do you want me to look for upcoming events in your city?");
                    }
                    var speechOutput = speech.ssml(true);

                    resolve(handlerInput.responseBuilder
                        .speak(speechOutput)
                        .reprompt(speechOutput)
                        .getResponse());
                }
            }else{

                console.log("User added in DB. Now fetching user address...");
                resolve(handlerInput.responseBuilder
                    .speak(messages.WELCOME)
                    .reprompt(messages.WELCOME)
                    .getResponse());
            }

        }else{
            console.log("Error. User does not exist. Creating new user...");

            DatabaseHelper.USERS_TABLE.insert({ 'userid': userid })
            .then(function(resp){

                console.log("User added in DB. Now fetching user address...");
                resolve(handlerInput.responseBuilder
                    .speak(messages.WELCOME)
                    .reprompt(messages.WELCOME)
                    .getResponse());
            });
        }
    });
  });
}

module.exports.LaunchRequest = LaunchRequest;
module.exports.handleLaunchRequest = handleLaunchRequest;