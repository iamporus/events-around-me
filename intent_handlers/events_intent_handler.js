const EventsHelper = require('./../helpers/events_helper');
const Utils = require('./../helpers/utils');

require('./../constants');

const EventsIntent = {
    canHandle(handlerInput) {
      const { request } = handlerInput.requestEnvelope;

      return request.type === 'IntentRequest' && request.intent.name === 'GetEventsAroundMe';
    },

    async handle(handlerInput) {

        //fetch user lat lng from session
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        if(attributes){
            console.log("Retrieved from Session inside GetEventsAroundMe: " + attributes.user.lat);
            const { request } = handlerInput.requestEnvelope;

            let date = new Date();
            let startDate = Utils.getFormattedDate(date);
            var nextWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7);
            let endDate = Utils.getFormattedDate(nextWeek);

            let category = CATEGORIES;

            if(request.intent){
                console.log("inside intents...");
                let slots = request.intent.slots;
                if(slots){
                    console.log("inside slots...");
                    if(slots.event_date){
                        //User wants to know events on an exact date.
                        console.log("date slot..."+ slots.event_date.value);
                        if(typeof slots.event_date.value !== 'undefined' && slots.event_date.value){
                            startDate = slots.event_date.value;
                            endDate = startDate;
                        }
                    }
                    if(slots.event_types){
                        //User wants to know particular type of event.
                        console.log("event slot..." + slots.event_types.value);
                        if(typeof slots.event_types.value !== 'undefined' && slots.event_types.value){
                            category = slots.event_types.value
                        }
                    }
                    if(slots.event_city){
                        //User wants to know events in a different city.
                        console.log("city slot..." + slots.event_city.value);
                        if(typeof slots.event_city.value !== 'undefined' && slots.event_city.value){
                            //TODO:
                        }
                    }
                }
            }

            const response = await EventsHelper.getEventsAroundUser(attributes.user.lat,
                                                                    attributes.user.lng,
                                                                    attributes.user.country,
                                                                    category, startDate, endDate);
                if(response.count > 0){
                    console.log("Events around me: " + response.count);

                    //save the response in the session for handling next/previous intent
                    attributes.events = response;
                    attributes.index = 0;
                    handlerInput.attributesManager.setSessionAttributes(attributes);

                    return handlerInput.responseBuilder
                        .speak("<speak>I found several interesting events around you. Here's the first one. "
                        + Utils.getShortEventDescription(response.results[0])
                        + ". <break time=\"2s\"/>"+ messages.DETAILS_OR_NEXT_REPROMPT + "</speak>")
                        .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
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
                .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                .getResponse();
            }
            index = index + 1;
            attributes.index = index;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            return handlerInput.responseBuilder
                .speak("Here's the next one. " + Utils.getShortEventDescription(attributes.events.results[index]))
                .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                .getResponse();
        }else{
            return handlerInput.responseBuilder
            .speak(messages.ERROR)
            .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
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
                .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                .getResponse();
            }

            index = index - 1;
            attributes.index = index;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            return handlerInput.responseBuilder
                .speak("Here's the previous one. " + Utils.getShortEventDescription(attributes.events.results[index]))
                .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                .getResponse();
        }else{
            return handlerInput.responseBuilder
            .speak(messages.ERROR)
            .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
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
                .speak("Okay. Let's start from the beginning. Here's the first one. "
                + Utils.getShortEventDescription(attributes.events.results[index]))
                .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                .getResponse();
        }else{
            return handlerInput.responseBuilder
            .speak(messages.ERROR)
            .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
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
            let events_flash = "<speak>Okay. Here's all the action around you in one go. <break time=\"1s\"/>";
            attributes.events.results.forEach(event => {
                events_flash += ""+ Utils.getShortEventDescription(event);
                events_flash += '. <break time=\"2s\"/>';

            });
            events_flash += 'That\'s it. You can say ask me to tell events on a particular day or date by saying, \'Tell me the events on this saturday\'.</speak>';

            return handlerInput.responseBuilder
                .speak(events_flash)
                .reprompt("You can say 'Start over' to listen to all the events one by one.")
                .getResponse();
        }else{
            return handlerInput.responseBuilder
            .speak(messages.ERROR)
            .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
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
            let date = Utils.getDateWithoutYear(ts);
            let time = Utils.getFormattedTime(ts);

            return handlerInput.responseBuilder.speak(Utils.getEventDescription(event)
                + " <break time=\"1s\"/> Do you want me to create a reminder for this event?")
                .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                .getResponse();
        }else{
            return handlerInput.responseBuilder
            .speak(messages.ERROR)
            .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
            .getResponse();
        }

    }
}

const RandomEventIntent = {

    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'RandomEventIntent';
    },

    async handle(handlerInput) {

        const attributes = handlerInput.attributesManager.getSessionAttributes();
        if(attributes){
            console.log("Retrieved from Session: " + attributes.index);
            console.log("Retrieved from Session: " + attributes.events.count);
            let rand = Math.floor(Math.random() * 9);

            attributes.index = rand;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            let event = attributes.events.results[rand];

            return handlerInput.responseBuilder
                .speak("This one looks interesting. " + Utils.getShortEventDescription(event))
                .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                .getResponse();

        }else{
            return handlerInput.responseBuilder
            .speak(messages.ERROR)
            .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
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
module.exports.RandomEventIntent = RandomEventIntent;

