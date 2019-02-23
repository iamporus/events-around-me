require('./../constants');
var Utils = require('../helpers/utils');

const CreateReminderIntent = {

  canHandle(handlerInput) {
      const { request } = handlerInput.requestEnvelope;

      return request.type === 'IntentRequest' && request.intent.name === 'CreateReminderIntent';
  },

  async handle(handlerInput) {

      const attributes = handlerInput.attributesManager.getSessionAttributes();

      if(attributes && typeof attributes.events !== 'undefined' && attributes.events){
          console.log("Retrieved from Session: " + attributes.index);
          console.log("Retrieved from Session: " + attributes.events.count);

          let consentToken = handlerInput.requestEnvelope.context.System.apiAccessToken;
          console.log("Retrieved consent from Session: " + consentToken);
          if (!consentToken && typeof consentToken === 'undefined') {
            return handlerInput.responseBuilder
            .speak(messages.NOTIFY_MISSING_PERMISSIONS)
            .withAskForPermissionsConsentCard(PERMISSIONS)
            .getResponse();
          }

          let index = attributes.index;
          let event = attributes.events.results[index];

          return createReminderForEvent(event, handlerInput);

      }else{
          return handlerInput.responseBuilder
          .speak(messages.ERROR_NO_EVENTS_FOUND)
          .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
          .getResponse();
      }

  }
}

const CreateReminderWithConsentIntent = {

  canHandle(handlerInput) {
      const { request } = handlerInput.requestEnvelope;

      return request.type === 'IntentRequest' && request.intent.name === 'CreateReminderWithConsentIntent';
  },

  async handle(handlerInput) {

      const attributes = handlerInput.attributesManager.getSessionAttributes();

      if(attributes && typeof attributes.events !== 'undefined' && attributes.events){
          console.log("Retrieved from Session: " + attributes.index);
          console.log("Retrieved from Session: " + attributes.events.count);

          let consentToken = handlerInput.requestEnvelope.context.System.apiAccessToken;
          console.log("Retrieved consent from Session: " + consentToken);
          if (!consentToken && typeof consentToken === 'undefined') {
            return handlerInput.responseBuilder
            .speak(messages.NOTIFY_MISSING_PERMISSIONS)
            .withAskForPermissionsConsentCard(PERMISSIONS)
            .getResponse();
          }

          let index = attributes.index;
          let event = attributes.events.results[index];
          let timezone = event.timezone;

          attributes.is_reminder_request = 'Yes';

          let speech = "This event starts at "+ Utils.getEventTime(event.start, timezone) + ". Would you like me to remind you about this event an hour before it starts?";

          return handlerInput.responseBuilder
          .speak(speech)
          .reprompt(messages.NEXT_REPROMPT)
          .getResponse();

      }else{
          return handlerInput.responseBuilder
          .speak(messages.ERROR_NO_EVENTS_FOUND)
          .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
          .getResponse();
      }

  }
}


async function createReminderForEvent(event, handlerInput){

  let timezone = event.timezone;
  let startDate = ""+ Utils.getReminderDate(event.start, timezone);
  let reminderTime = "" + Utils.getReminderTime(event.start, timezone);
  let reminderDate = "" + Utils.getReminderDateForText(event.start, timezone);
  startDate = startDate.substring(0,startDate.length - 1);

  console.log("Event start Date: " + startDate);
  console.log("Event start time: " + reminderTime);
  console.log("Event start time: " + reminderDate);
  console.log("Event timezone: " + timezone);

  try {
      const client = handlerInput.serviceClientFactory.getReminderManagementServiceClient();

      const reminderRequest = {

        trigger: {
          type: 'SCHEDULED_ABSOLUTE',
          scheduledTime: startDate,
          timeZoneId: timezone
        },
        alertInfo: {
          spokenInfo: {
            content: [{
              locale: 'en-IN',
              text: event.title + " starts in one hour at " + Utils.getEventTime(event.start, timezone),
            }],
          },
        },
        pushNotification: {
          status: 'ENABLED',
        },
      };
      const reminderResponse = await client.createReminder(reminderRequest);
      console.log(JSON.stringify(reminderResponse));
    } catch (error) {
      console.log("Inside catch... ");
      if (error.name !== 'ServiceError') {
        console.log(`error: ${error.stack}`);
        const response = handlerInput.responseBuilder.speak(messages.ERROR)
        .reprompt(messages.NEXT_REPROMPT).getResponse();
        return response;
      }
      console.log(error.stack);
      throw error;
  }

  console.log("Returning from the intent... ");
  return handlerInput.responseBuilder
      .speak('Okay. I will remind you about this event at ' + reminderTime + ' on ' + reminderDate + ". "
      +  messages.NEXT_REPROMPT)
      .reprompt(messages.NEXT_REPROMPT)
      .withSimpleCard('Reminder from My Events', event.title + " at " + Utils.getEventTime(event.start, timezone)
      + ' on ' + reminderDate + ". ")
      .getResponse();
}

module.exports.CreateReminderIntent = CreateReminderIntent;
module.exports.CreateReminderWithConsentIntent = CreateReminderWithConsentIntent;