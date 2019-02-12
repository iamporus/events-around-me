require('./../constants');
var Utils = require('../helpers/utils');

const CreateReminderIntent = {

    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'CreateReminderIntent';
    },

    async handle(handlerInput) {

        const attributes = handlerInput.attributesManager.getSessionAttributes();
        const { request } = handlerInput.requestEnvelope;
        if(attributes && typeof attributes.events !== 'undefined' && attributes.events){
            console.log("Retrieved from Session: " + attributes.index);
            console.log("Retrieved from Session: " + attributes.events.count);
            let index = attributes.index;

            let event = attributes.events.results[index];
            let timezone = event.timezone;
            let startDate = ""+ Utils.getReminderDate(event.start, timezone);
            startDate = startDate.substring(0,startDate.length - 1);
            let consentToken = handlerInput.requestEnvelope.context.System.apiAccessToken;
            console.log("Retrieved consent from Session: " + consentToken);
            console.log("Event start Date: " + startDate);
            console.log("Event timezone: " + timezone);

            if (!consentToken && typeof consentToken === 'undefined') {
                return responseBuilder
                  .speak(messages.NOTIFY_MISSING_PERMISSIONS)
                  .withAskForPermissionsConsentCard(PERMISSIONS)
                  .getResponse();
            }

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
                        text: event.title,
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
                  const response = responseBuilder.speak(messages.ERROR).getResponse();
                  return response;
                }
                console.log(error.stack);
                throw error;
              }

            handlerInput.attributesManager.setSessionAttributes(attributes);
            console.log("Returning from the intent... ");
            return handlerInput.responseBuilder
                .speak(messages.REMINDER_CREATED)
                .getResponse();
        }else{
            return handlerInput.responseBuilder
            .speak(messages.ERROR_NO_EVENTS_FOUND)
            .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
            .getResponse();
        }

    }
}

module.exports.CreateReminderIntent = CreateReminderIntent;