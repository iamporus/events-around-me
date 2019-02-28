const Alexa = require('ask-sdk-core');

require('./constants.js');
const AddressIntentHandler = require('./intent_handlers/address_intent_handler.js');
const EventsIntentHandler = require('./intent_handlers/events_intent_handler.js');
const LaunchIntentHandler = require('./intent_handlers/launch_intent_handler.js');
const SessionIntentHandler = require('./intent_handlers/session_intent_handler.js');
const RemindersIntentHandler = require('./intent_handlers/reminders_intent_handler.js');
const ErrorHandler = require('./intent_handlers/error_handler.js');
const DatabaseHelper = require('./helpers/database_helper.js');

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
            if(attributes.is_city_name_confirmation && typeof attributes.is_city_name_confirmation !== 'undefined'){
              //Said yes for confirming found city
              //Save user city in db
              let user = attributes.user;
              DatabaseHelper.saveUserAddress(user.userid, user.lat, user.lng, user.city, 'NA', user.country);

              return EventsIntentHandler.EventsIntent.handle(handlerInput);
            }
            else if(attributes.is_reminder_request && typeof attributes.is_reminder_request !== 'undefined'){
              //Said yes for creating reminder
              return RemindersIntentHandler.CreateReminderIntent.handle(handlerInput);
            }
            else if(attributes.look_events_in_another_city && typeof attributes.look_events_in_another_city !== 'undefined'){
              //Said yes for lookup of events in another city
              return handlerInput.responseBuilder
              .speak(messages.NEW_CITY)
              .reprompt(messages.NEW_CITY_RE)
              .getResponse();
            }
            else if(attributes.default_city_event_confirmation && typeof attributes.default_city_event_confirmation !== 'undefined'){
              //Said yes for lookup of events in default city
              return EventsIntentHandler.EventsIntent.handle(handlerInput);
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
    const attributes = handlerInput.attributesManager.getSessionAttributes();
        if(attributes ){
          if(attributes.is_reminder_request && typeof attributes.is_reminder_request !== 'undefined'){
            return handlerInput.responseBuilder
              .speak(messages.NO_REMINDER_PROMT)
              .reprompt(messages.NEXT_REPROMPT)
              .getResponse();
          }
          else if(attributes.is_city_name_confirmation && typeof attributes.is_city_name_confirmation !== 'undefined'){
            return handlerInput.responseBuilder
              .speak(messages.REPEAT_CITY_NAME)
              .reprompt(messages.REPEAT_CITY_NAME_RE)
              .getResponse();
          }
          else if(attributes.default_city_event_confirmation && typeof attributes.default_city_event_confirmation !== 'undefined'){

            //Said No for lookup of events in default city
            //Ask whether he wants to look events in other city
            attributes.look_events_in_another_city = true;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            return handlerInput.responseBuilder
              .speak(messages.CHANGE_CITY)
              .reprompt(messages.CHANGE_CITY_RE)
              .getResponse();
          }
        }

  },
};


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchIntentHandler.LaunchRequest,
    AddressIntentHandler.AddressIntent,
    AddressIntentHandler.GetCityNameIntent,
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
  .addErrorHandlers(ErrorHandler.MissingPermissionsError)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();