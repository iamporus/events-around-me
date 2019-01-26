const EventsHelper = require('./../helpers/events_helper');
const LaunchIntentHandler =  require('./launch_intent_handler');
const Utils = require('./../helpers/utils');
var Speech = require('ssml-builder');

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

            if(!attributes.user){
                // user has directly invoked this event without opening the skill
                // no previous data is present. we don't even know whether user is in db or not
                // hence forward this event to launch event.

                return LaunchIntentHandler.handleLaunchRequest(handlerInput);
            }
            else{
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

                    if(attributes.intent_to_cater)
                    {
                        if(attributes.intent_to_cater == 'FlashEventIntent')
                        {
                            handlerInput.attributesManager.setSessionAttributes(attributes);
                            return FlashEventIntent.handle(handlerInput);
                        }
                    }
                    handlerInput.attributesManager.setSessionAttributes(attributes);

                    var speech = new Speech();
                    speech.say('Hi. Here are some events that I found in your neighborhood. Here\'s the first one. ')
                    .pause('1s')
                    .say(Utils.getShortEventDescription(response.results[0]))
                    .pause('1s')
                    .say(' ' + messages.DETAILS_OR_NEXT_REPROMPT);

                    var speechOutput = speech.ssml(true);

                    return handlerInput.responseBuilder
                        .speak(speechOutput)
                        .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                        .withSimpleCard(response.results[0].title,Utils.getEventDescriptionForCard(response.results[0]))
                        .getResponse();
                }
                else{
                    return handlerInput.responseBuilder
                        .speak("Sorry. I could not find any events around you. Seems like a dull week.")
                        .reprompt("")
                        .getResponse();
                }
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
        if(attributes && typeof attributes.events !== 'undefined' && attributes.events){
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
            .speak(messages.ERROR_NO_EVENTS_FOUND)
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
        if(attributes && typeof attributes.events !== 'undefined' && attributes.events){
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
            .speak(messages.ERROR_NO_EVENTS_FOUND)
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
        if(attributes && typeof attributes.events !== 'undefined' && attributes.events){
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
            .speak(messages.ERROR_NO_EVENTS_FOUND)
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

        console.log("Inside Flash Request...");
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        // console.log("attributes: " + attributes);
        if(attributes){

            if(!attributes.events){
                // user has directly invoked this event without opening the skill
                // no previous data is present. we don't even know whether user is in db or not
                // hence forward this event to launch event and pass along an identifier suggesting the
                // original event to cater is a Flash-All event.
                attributes.intent_to_cater = 'FlashEventIntent';
                handlerInput.attributesManager.setSessionAttributes(attributes);
                return LaunchIntentHandler.handleLaunchRequest(handlerInput);

            }else{
                console.log("Retrieved from Session: " + attributes.index);
                console.log("Retrieved from Session: " + attributes.events.count);
                let index = attributes.index;
                if(index != 0){
                    index = 0;
                }

                attributes.index = index;
                handlerInput.attributesManager.setSessionAttributes(attributes);

                const { request } = handlerInput.requestEnvelope;

                var speech = new Speech();

                if(request.intent && request.intent.slots && request.intent.slots.event_date
                    && typeof request.intent.slots.event_date.value !== 'undefined' && request.intent.slots.event_date.value){

                    let slots = request.intent.slots;

                    //User wants to know events on an exact date.
                    console.log("date slot..."+ slots.event_date.value);
                    let startDate = slots.event_date.value;
                    let endDate = startDate;

                    const response = await EventsHelper.getEventsAroundUser(attributes.user.lat,
                        attributes.user.lng,
                        attributes.user.country,
                        CATEGORIES, startDate, endDate);

                    if(response.results.length > 0){

                        attributes.index = 0;
                        attributes.events = response.results;
                        handlerInput.attributesManager.setSessionAttributes(attributes);

                        speech.say("Okay. Here's all the action on ")
                        .say(Utils.getDateWithoutYear(startDate)+". ")
                        .pause('1s');
                        response.results.forEach(event => {
                            speech.say(Utils.getShortEventDescriptionWithoutDate(event));
                            speech.pause('1s');
                        });
                        speech.pause('2s');

                    }else{
                        speech.say("Sorry. I couldn't find any events on " + Utils.getFormattedDate(startDate));
                    }
                }else{
                    speech.say("Okay. Here's all the action in next 7 days. ")
                    .pause('1s');
                    attributes.events.results.forEach(event => {
                        speech.say(Utils.getShortEventDescription(event));
                        speech.pause('1s');
                    });
                    speech.pause('2s');
                }

                speech.say(messages.DETAILS_OR_APP);
                var speechOutput = speech.ssml(true);

                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt("You can say 'Start over' to listen to all the events one by one.")
                    .getResponse();
            }
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

            if(!attributes.user){
                // user has directly invoked this event without opening the skill
                // no previous data is present. we don't even know whether user is in db or not
                // hence forward this event to launch event and pass along an identifier suggesting the
                // original event to cater is a DetailsEventIntent.
                attributes.intent_to_cater = 'DetailsEventIntent';
                handlerInput.attributesManager.setSessionAttributes(attributes);
                return LaunchIntentHandler.handleLaunchRequest(handlerInput);

            }else{

                const { request } = handlerInput.requestEnvelope;

                if(request.intent && request.intent.slots && request.intent.slots.event_name
                    && typeof request.intent.slots.event_name.value !== 'undefined' && request.intent.slots.event_name.value){

                    let slots = request.intent.slots;

                    //User wants to know about a particular event.
                    console.log("Event..."+ slots.event_name.value);
                    let event_name = slots.event_name.value;

                    let event_details = await EventsHelper.getAParticularEvent(attributes.user.lat, attributes.user.lng,
                        encodeURIComponent(slots.event_name.value), attributes.user.country, CATEGORIES);

                    if(typeof event_details.results !== 'undefined' && event_details.results && event_details.results.length > 0 ){

                        let event = event_details.results[0];

                        var speech = new Speech();
                        speech.say(Utils.getEventDescription(event));
                        var speechOutput = speech.ssml(true);

                        return handlerInput.responseBuilder.speak(speechOutput)
                            .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                            .getResponse();
                    }else{
                        var speech = new Speech();
                        speech.say('Sorry. I couldn\'t find any event named ' + event_name + ' in your neighborhood.' );
                        var speechOutput = speech.ssml(true);
                        return handlerInput.responseBuilder.speak(speechOutput)
                        .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                        .getResponse();
                    }
                }
                else if(attributes.events){
                    console.log("Retrieved from Session: " + attributes.index);
                    let index = attributes.index;

                    attributes.index = index;
                    handlerInput.attributesManager.setSessionAttributes(attributes);

                    let event = attributes.events.results[index];

                    var speech = new Speech();
                    speech.say(Utils.getEventDescription(event));
                    var speechOutput = speech.ssml(true);

                    return handlerInput.responseBuilder.speak(speechOutput)
                    .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                    .getResponse();

                }else{
                    return handlerInput.responseBuilder.speak(messages.ERROR)
                        .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                        .getResponse();
                }
            }
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

