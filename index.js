const Alexa = require('ask-sdk-core');

require('./constants.js');
const AddressIntentHandler = require('./intent_handlers/address_intent_handler.js');
const EventsIntentHandler = require('./intent_handlers/events_intent_handler.js');
const LaunchIntentHandler = require('./intent_handlers/launch_intent_handler.js');
const SessionIntentHandler = require('./intent_handlers/session_intent_handler.js');
const RemindersIntentHandler = require('./intent_handlers/reminders_intent_handler.js');

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
    const attributes = handlerInput.attributesManager.getSessionAttributes();
        if(attributes){
            console.log("Retrieved from Session: From Reminder? " + attributes.is_reminder_request);
            if(attributes.is_reminder_request && typeof attributes.is_reminder_request !== 'undefined'){
              return RemindersIntentHandler.CreateReminderIntent.handle(handlerInput);
            }
        }
    return EventsIntentHandler.EventsIntent.handle(handlerInput);
  },
};

const StopIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' &&
    (request.intent.name === 'AMAZON.StopIntent'
    || request.intent.name === 'AMAZON.NavigateHomeIntent'
    || request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.NAVIGATE_HOME)
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
      .speak(messages.NO_REMINDER_PROMT)
      .reprompt(messages.NEXT_REPROMPT)
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
    RemindersIntentHandler.CreateReminderIntent,
    RemindersIntentHandler.CreateReminderWithConsentIntent,
    HelpIntent,
    YesIntent,
    NoIntent,
    StopIntent,
    UnhandledIntent
  )
  .addErrorHandlers(AddressIntentHandler.AddressError)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();