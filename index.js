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
    return EventsIntentHandler.EventsIntent.handle(handlerInput);
  },
};

const StopIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' &&
    (request.intent.name === 'AMAZON.StopIntent'
    || request.intent.name === 'AMAZON.NoIntent'
    || request.intent.name === 'AMAZON.NavigateHomeIntent'
    || request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.NAVIGATE_HOME)
      .getResponse();
  },
};


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchIntentHandler.LaunchRequest,
    AddressIntentHandler.AddressIntent,
    EventsIntentHandler.EventsIntent,
    EventsIntentHandler.NextEventIntent,
    EventsIntentHandler.PreviousEventIntent,
    EventsIntentHandler.RepeatEventIntent,
    EventsIntentHandler.FlashEventIntent,
    EventsIntentHandler.DetailsEventIntent,
    EventsIntentHandler.RandomEventIntent,
    SessionIntentHandler.SessionEndedRequest,
    HelpIntent,
    YesIntent,
    StopIntent,
    UnhandledIntent
  )
  .addErrorHandlers(AddressIntentHandler.AddressError)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();