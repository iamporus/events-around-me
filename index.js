const Alexa = require('ask-sdk-core');

require('./constants.js');
const AddressIntentHandler = require('./intent_handlers/address_intent_handler.js');
const EventsIntentHandler = require('./intent_handlers/events_intent_handler.js');
const LaunchIntentHandler = require('./intent_handlers/launch_intent_handler.js');
const SessionIntentHandler = require('./intent_handlers/session_intent_handler.js');
const RemindersIntentHandler = require('./intent_handlers/reminders_intent_handler.js');
const ErrorHandler = require('./intent_handlers/error_handler.js');
const DatabaseHelper = require('./helpers/database_helper.js');
const Utils = require('./helpers/utils.js');

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
    if(attributes && typeof attributes.action_to_perform !== 'undefined'){

      console.log("Inside YESIntent. Action to Perform: " + attributes.action_to_perform);

      switch(attributes.action_to_perform){
        case ActionToPerform.EVENT_LOOKUP_DEFAULT_CITY:{

          //Said yes for lookup of events in default city
          return EventsIntentHandler.EventsIntent.handle(handlerInput);
        }
        case ActionToPerform.EVENT_LOOKUP_NEW_CITY:{

          //Said yes for lookup of events in another city
          return handlerInput.responseBuilder
            .speak(messages.NEW_CITY)
            .reprompt(messages.NEW_CITY_RE)
            .getResponse();
        }
        case ActionToPerform.CONFIRM_NEW_CITY:{

          //Said yes for confirming found city
          //Save user city in db
          let user = attributes.user;
          DatabaseHelper.saveUserAddress(user.userid, user.lat, user.lng, user.city, 'NA', user.country);

          return EventsIntentHandler.EventsIntent.handle(handlerInput);
        }
        case ActionToPerform.CREATE_REMINDER:{

          //Said yes for creating reminder
          return RemindersIntentHandler.CreateReminderIntent.handle(handlerInput);
        }
        case ActionToPerform.EVENT_DETAILS:{

          //Said yes for telling the details
          return EventsIntentHandler.DetailsEventIntent.handle(handlerInput);
        }
        case ActionToPerform.FETCH_MORE_EVENTS:{

          //Said yes for fetching more events
          return EventsIntentHandler.NextEventIntent.handle(handlerInput);
        }
        case ActionToPerform.REPEAT_EVENTS:{

          //Said yes for repeat from start
          return EventsIntentHandler.RepeatEventIntent.handle(handlerInput);
        }
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
    if(attributes && typeof attributes.action_to_perform !== 'undefined'){

      console.log("Inside NOIntent. Action to Perform: " + attributes.action_to_perform);

      switch(attributes.action_to_perform){
        case ActionToPerform.EVENT_LOOKUP_DEFAULT_CITY:{

          //Said No for lookup of events in default city
          //Ask whether he wants to look events in other city
          attributes.action_to_perform = ActionToPerform.EVENT_LOOKUP_NEW_CITY;
          handlerInput.attributesManager.setSessionAttributes(attributes);

          return handlerInput.responseBuilder
            .speak(messages.CHANGE_CITY)
            .reprompt(messages.CHANGE_CITY_RE)
            .getResponse();
        }
        case ActionToPerform.EVENT_LOOKUP_NEW_CITY:{

          //Said No for lookup of events in other city as well
          //Say Sayonara.
          return StopIntent.handle(handlerInput);
        }
        case ActionToPerform.CONFIRM_NEW_CITY:{

          //Said No for confirming found city
          return handlerInput.responseBuilder
            .speak(messages.REPEAT_CITY_NAME)
            .reprompt(messages.REPEAT_CITY_NAME_RE)
            .getResponse();
        }
        case ActionToPerform.CREATE_REMINDER:{

          //Said No for creating reminder
          //If 3 events have been spoken, get consent for fetching next 3
          let index = attributes.index;
          if((index + 1) % 3 == 0){

            attributes.action_to_perform = ActionToPerform.FETCH_MORE_EVENTS;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            return handlerInput.responseBuilder
              .speak(Utils.randomize(fetchNextThree))
              .reprompt(Utils.randomize(fetchNextThree))
              .getResponse();
          }
          else{
            return EventsIntentHandler.NextEventIntent.handle(handlerInput);
          }
        }
        case ActionToPerform.EVENT_DETAILS:{

          //Said No for telling the details
          //If 3 events have been spoken, get consent for fetching next 3
          let index = attributes.index;
          if((index + 1) % 3 == 0){

            attributes.action_to_perform = ActionToPerform.FETCH_MORE_EVENTS;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            return handlerInput.responseBuilder
              .speak(Utils.randomize(fetchNextThree))
              .reprompt(Utils.randomize(fetchNextThree))
              .getResponse();
          }
          else{
            return EventsIntentHandler.NextEventIntent.handle(handlerInput);
          }
        }
        case ActionToPerform.FETCH_MORE_EVENTS:{

          //Said No to look for more events. Ask whether he wants to look events in another city.
          attributes.action_to_perform = ActionToPerform.EVENT_LOOKUP_NEW_CITY;
          handlerInput.attributesManager.setSessionAttributes(attributes);

          return handlerInput.responseBuilder
            .speak(messages.CHANGE_CITY)
            .reprompt(messages.CHANGE_CITY_RE)
            .getResponse();
        }
        case ActionToPerform.REPEAT_EVENTS:{

          //Said No for repeat from start
          //Ask whether he wants to look events in another city.
          attributes.action_to_perform = ActionToPerform.EVENT_LOOKUP_NEW_CITY;
          handlerInput.attributesManager.setSessionAttributes(attributes);

          return handlerInput.responseBuilder
            .speak(messages.CHANGE_CITY)
            .reprompt(messages.CHANGE_CITY_RE)
            .getResponse();
        }
      }
    }

    return StopIntent.handle(handlerInput);
  },
};


const skillBuilder = Alexa.SkillBuilders.custom();

module.exports.NoIntent = NoIntent;

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchIntentHandler.LaunchRequest,
    AddressIntentHandler.AddressIntent,
    AddressIntentHandler.GetCityNameIntent,
    EventsIntentHandler.EventsIntent,
    EventsIntentHandler.NextEventIntent,
    EventsIntentHandler.PreviousEventIntent,
    EventsIntentHandler.RepeatEventIntent,
    EventsIntentHandler.DetailsEventIntent,
    EventsIntentHandler.RandomEventIntent,
    EventsIntentHandler.GetEventByDateIntent,
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