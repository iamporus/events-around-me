const Alexa = require('ask-sdk-core');

require('./constants.js');
const AddressIntentHandler = require('./intent_handlers/address_intent_handler.js');
const EventsIntentHandler = require('./intent_handlers/events_intent_handler.js');
const LaunchIntentHandler = require('./intent_handlers/launch_intent_handler.js');
const SessionIntentHandler = require('./intent_handlers/session_intent_handler.js');

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.UNHANDLED)
      .reprompt(messages.UNHANDLED)
      .getResponse();
  },
};

const HelpIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.HELP)
      .reprompt(messages.HELP)
      .getResponse();
  },
};


const YesIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {

    //Get user address first as it is necessary to fetch events around him.
    return EventsIntentHandler.EventsIntent.handle(handlerInput);
  },
};

const CancelIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.GOODBYE)
      .getResponse();
  },
};

const NoIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.GOODBYE)
      .getResponse();
  },
};

const StopIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.STOP)
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchIntentHandler.LaunchRequest,
    AddressIntentHandler.AddressIntent,
    EventsIntentHandler.EventsIntent,
    SessionIntentHandler.SessionEndedRequest,
    HelpIntent,
    CancelIntent,
    YesIntent,
    StopIntent,
    NoIntent,
    UnhandledIntent
  )
  .addErrorHandlers(AddressIntentHandler.AddressError)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();