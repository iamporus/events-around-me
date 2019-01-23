const EventsHelper = require('./../helpers/events_helper.js');
const DatabaseHelper = require('../helpers/database_helper.js');

require('./../constants.js');

const EventsIntent = {
    canHandle(handlerInput) {
      const { request } = handlerInput.requestEnvelope;

      return request.type === 'IntentRequest' && request.intent.name === 'GetEventsAroundMe';
    },

    async handle(handlerInput) {

      const response = await EventsHelper.getEventsAroundUser(1,2);
      if(response.count > 0){
          console.log("Events around me: " + response.count);

          return handlerInput.responseBuilder
          .speak("<speak>I found more than 5 events around you. Here's the first one. " + response.results[0].title
          + ". <break time=\"2s\"/> You can say 'Tell me details' to get details about this event or say Next to hear the next one.</speak>")
          .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
          .getResponse();

        // response.results.forEach(function(event){
        //     console.log(event.title);
        // });
      }
      else
      {
        return handlerInput
        .speak("Sorry. I could not find any events around you. Looks like everybody is busy in their day jobs.")
        .reprompt("You can say 'Tell me events from other cities'.")
        .getResponse();
      }
    }
}

module.exports.EventsIntent = EventsIntent;
