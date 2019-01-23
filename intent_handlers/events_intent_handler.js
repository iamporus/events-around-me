const EventsHelper = require('./../helpers/events_helper.js');
const DatabaseHelper = require('../helpers/database_helper.js');

require('./../constants.js');

const EventsIntent = {
    canHandle(handlerInput) {
      const { request } = handlerInput.requestEnvelope;

      return request.type === 'IntentRequest' && request.intent.name === 'GetEventsAroundMe';
    },

    async handle(handlerInput) {

        //fetch user lat lng from session
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        if(attributes){
            console.log("Retrieved from Session: " + attributes.user.lat);

            const response = await EventsHelper.getEventsAroundUser(attributes.user.lat, attributes.user.lng);
                if(response.count > 0){
                    console.log("Events around me: " + response.count);

                    //save the response in the session for handling next/previous intent
                    attributes.events = response;
                    attributes.index = 0;
                    handlerInput.attributesManager.setSessionAttributes(attributes);

                    return handlerInput.responseBuilder
                        .speak("<speak>I found several interesting events around you. Here's the first one. " + response.results[0].title
                        + ". <break time=\"2s\"/> You can say 'Tell me details' to get details about this event or say Next to hear the next one.</speak>")
                        .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
                        .getResponse();
                }
                else{
                    return handlerInput.responseBuilder
                        .speak("Sorry. I could not find any events around you. Looks like everybody is busy in their day jobs.")
                        .reprompt("You can say 'Tell me events from other cities'.")
                        .getResponse();
                }
        }
        else{
            return handlerInput.responseBuilder
                .speak("Sorry. I could not find any events around you. Looks like everybody is busy in their day jobs.")
                .reprompt("You can say 'Tell me events from other cities'.")
                .getResponse();
        }
    }
}

const NextEventIntent = {

    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NextIntent';
    },

    async handle(handlerInput) {

        const attributes = handlerInput.attributesManager.getSessionAttributes();
        if(attributes){
            console.log("Retrieved from Session: " + attributes.index);
            console.log("Retrieved from Session: " + attributes.events.count);
            let index = attributes.index;

            if(index == 9)
            {
                return handlerInput.responseBuilder
                .speak("Oh! that was the last one on my list. You can say Repeat to start over.")
                .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
                .getResponse();
            }
            index = index + 1;
            attributes.index = index;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            return handlerInput.responseBuilder
                .speak("Here's the next one. " + attributes.events.results[index].title)
                .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
                .getResponse();
        }else{
            return handlerInput.responseBuilder
            .speak(messages.ERROR)
            .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
            .getResponse();
        }

    }
}

const PreviousEventIntent = {

    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PreviousIntent';
    },

    async handle(handlerInput) {

        const attributes = handlerInput.attributesManager.getSessionAttributes();
        if(attributes){
            console.log("Retrieved from Session: " + attributes.index);
            console.log("Retrieved from Session: " + attributes.events.count);
            let index = attributes.index;
            if(index == 0)
            {
                return handlerInput.responseBuilder
                .speak("Oh! I can't go back than this. This is the first one in the list.")
                .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
                .getResponse();
            }

            index = index - 1;
            attributes.index = index;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            return handlerInput.responseBuilder
                .speak("Here's the last one. " + attributes.events.results[index].title)
                .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
                .getResponse();
        }else{
            return handlerInput.responseBuilder
            .speak(messages.ERROR)
            .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
            .getResponse();
        }

    }
}

const RepeatEventIntent = {

    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.RepeatIntent';
    },

    async handle(handlerInput) {

        const attributes = handlerInput.attributesManager.getSessionAttributes();
        if(attributes){
            console.log("Retrieved from Session: " + attributes.index);
            console.log("Retrieved from Session: " + attributes.events.count);
            let index = attributes.index;
            if(index != 0)
            {
                index = 0;
            }

            attributes.index = index;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            return handlerInput.responseBuilder
                .speak("Okay. Let's start from the beginning. Here's the first one. " + attributes.events.results[index].title)
                .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
                .getResponse();
        }else{
            return handlerInput.responseBuilder
            .speak(messages.ERROR)
            .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
            .getResponse();
        }

    }
}

const FlashEventIntent = {

    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'FlashEventIntent';
    },

    async handle(handlerInput) {

        const attributes = handlerInput.attributesManager.getSessionAttributes();

        if(attributes){
            console.log("Retrieved from Session: " + attributes.index);
            console.log("Retrieved from Session: " + attributes.events.count);
            let index = attributes.index;
            if(index != 0)
            {
                index = 0;
            }

            attributes.index = index;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            let counter = 1;
            //TODO: append index to events.
            let events_flash = "<speak>Okay. Here's all the action around you in one go. You can stop the briefing by saying, Stop. <break time=\"1s\"/>";
            attributes.events.results.forEach(event => {
                events_flash += ""+ event.title +  ' <break time=\"1s\"/> on ';
                var ts = new Date(event.start);
                events_flash += ts.toDateString().substring(0,ts.toDateString().length - 4) + '<break time=\"1s\"/>';

            });
            events_flash += 'That\'s it. You can say ask me to tell events on a particular day or date by saying, \'Tell me the events on this saturday\'.</speak>';

            return handlerInput.responseBuilder
                .speak(events_flash)
                .reprompt("You can say 'Start over' to listen to all the events one by one.")
                .getResponse();
        }else{
            return handlerInput.responseBuilder
            .speak(messages.ERROR)
            .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
            .getResponse();
        }

    }
}

const DetailsEventIntent = {

    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'DetailsEventIntent';
    },

    async handle(handlerInput) {

        const attributes = handlerInput.attributesManager.getSessionAttributes();
        if(attributes){
            console.log("Retrieved from Session: " + attributes.index);
            console.log("Retrieved from Session: " + attributes.events.count);
            let index = attributes.index;

            attributes.index = index;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            //TODO: add description when available.
            //TODO: create reminder intent
            let event = attributes.events.results[index];
            var ts = new Date(event.start);
            let date = ts.toDateString().substring(0,ts.toDateString().length - 4);
            let time = ts.toTimeString().substring(0,ts.toDateString().length - 10);

            return handlerInput.responseBuilder
                .speak("Sure. The event " + event.title + ", is a " + event.category + " type of event. It is scheduled on "
                + date + " and starts at " + time +". <break time=\"1s\"/> Do you want me to create a reminder for this event?")
                .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
                .getResponse();
        }else{
            return handlerInput.responseBuilder
            .speak(messages.ERROR)
            .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
            .getResponse();
        }

    }
}

module.exports.EventsIntent = EventsIntent;
module.exports.NextEventIntent = NextEventIntent;
module.exports.PreviousEventIntent = PreviousEventIntent;
module.exports.RepeatEventIntent = RepeatEventIntent;
module.exports.FlashEventIntent = FlashEventIntent;
module.exports.DetailsEventIntent = DetailsEventIntent;

