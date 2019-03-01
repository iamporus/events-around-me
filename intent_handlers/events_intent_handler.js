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
                var nextWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
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
                        if(attributes.intent_to_cater == 'RandomEventIntent')
                        {
                            handlerInput.attributesManager.setSessionAttributes(attributes);
                            return RandomEventIntent.handle(handlerInput);
                        }
                    }

                    handlerInput.attributesManager.setSessionAttributes(attributes);

                    var speech = new Speech();

                    if(response.count == 1){

                        attributes.action_to_perform = ActionToPerform.CREATE_REMINDER;

                        speech.say('Okay. I found just one event happening in '+ attributes.user.city + ' this week. Here\'s how it goes. ')
                        .pause('1s')
                        .say(Utils.getShortEventDescription(response.results[0]))
                        .pause('1s')
                        .say(' ' + messages.REMINDER_PROMT);
                    }else{

                        attributes.action_to_perform = ActionToPerform.EVENT_DETAILS;

                        speech.say('Alright. Here are some events that I found in '+ attributes.user.city + ' this week. Here\'s the first one. ')
                            .pause('1s')
                            .say(Utils.getShortEventDescription(response.results[0]))
                            .pause('1s')
                            .say(' ' + Utils.randomize(interesting));
                    }

                    var speechOutput = speech.ssml(true);

                    return handlerInput.responseBuilder
                        .speak(speechOutput)
                        .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                        .getResponse();
                }
                else{

                    //Ask whether he wants to look events in other city
                    attributes.action_to_perform = ActionToPerform.EVENT_LOOKUP_NEW_CITY;

                    handlerInput.attributesManager.setSessionAttributes(attributes);

                    return handlerInput.responseBuilder
                        .speak("Sorry. I could not find any events in "+ attributes.user.city+". " + messages.CHANGE_CITY_RE)
                        .reprompt(messages.CHANGE_CITY_RE)
                        .getResponse();
                }
            }
        }
        else{
            return handlerInput.responseBuilder
                .speak("Sorry. I could not find any events around you. Looks like everybody is busy in their day jobs. Bye")
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
            index = index + 1;
            attributes.index = index;

            if(index == 10)
            {
                attributes.action_to_perform = ActionToPerform.REPEAT_EVENTS;
                handlerInput.attributesManager.setSessionAttributes(attributes);

                return handlerInput.responseBuilder
                .speak("Oh! that was the last one on my list. Do you want me to repeat all the events from the start?")
                .reprompt('Do you want me to repeat all the events from the start?')
                .getResponse();
            }

            attributes.action_to_perform = ActionToPerform.EVENT_DETAILS;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            return handlerInput.responseBuilder
                .speak("Okay. Here's the next one. " + Utils.getShortEventDescription(attributes.events.results[index])
                + ' ' + Utils.randomize(interesting))
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
                attributes.action_to_perform = ActionToPerform.REPEAT_EVENTS;
                handlerInput.attributesManager.setSessionAttributes(attributes);

                return handlerInput.responseBuilder
                .speak("Oh! I can't go back than this. This is the first one in the list. Do you want me to repeat all the events from start?")
                .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                .getResponse();
            }

            index = index - 1;
            attributes.index = index;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            return handlerInput.responseBuilder
                .speak("Here's the previous one. " + Utils.getShortEventDescription(attributes.events.results[index])
                + ' ' + Utils.randomize(interesting))
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
            attributes.action_to_perform = ActionToPerform.EVENT_DETAILS;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            return handlerInput.responseBuilder
                .speak("Okay. Let's start from the beginning. Here's the first one. "
                + Utils.getShortEventDescription(attributes.events.results[index])
                + ' ' + Utils.randomize(interesting))
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
                        speech.pause('1s');
                        speech.say(messages.REMINDER_PROMT);
                        var speechOutput = speech.ssml(true);

                        attributes.action_to_perform = ActionToPerform.CREATE_REMINDER;

                        return handlerInput.responseBuilder.speak(speechOutput)
                            .reprompt(messages.NEXT_REPROMPT)
                            .getResponse();
                    }else{
                        var speech = new Speech();
                        speech.say('Sorry. I couldn\'t find any event named ' + event_name + ' in your neighborhood.' );
                        speech.say(" You can say 'Tell me all the events' to listen to all the events in upcoming week.");
                        var speechOutput = speech.ssml(true);

                        return handlerInput.responseBuilder.speak(speechOutput)
                            .reprompt(messages.NEXT_REPROMPT)
                            .getResponse();
                    }
                }
                else if(attributes.events){
                    console.log("Retrieved from Session: " + attributes.index);
                    let index = attributes.index;

                    attributes.index = index;

                    let event = attributes.events.results[index];

                    var speech = new Speech();
                    speech.say(Utils.getEventDescription(event));
                    speech.pause('1s');
                    speech.say(messages.REMINDER_PROMT);
                    var speechOutput = speech.ssml(true);

                    attributes.action_to_perform = ActionToPerform.CREATE_REMINDER;
                    handlerInput.attributesManager.setSessionAttributes(attributes);

                    return handlerInput.responseBuilder.speak(speechOutput)
                    .reprompt(messages.NEXT_REPROMPT)
                    .getResponse();

                }else{
                    return handlerInput.responseBuilder.speak(messages.ERROR)
                        .reprompt(messages.NEXT_REPROMPT)
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
        console.log("Inside RandomEventIntent..." );
        if(attributes){

            if(!attributes.user){
                // user has directly invoked this event without opening the skill
                // no previous data is present. we don't even know whether user is in db or not
                // hence forward this event to launch event and pass along an identifier suggesting the
                // original event to cater is a RandomEventIntent.
                attributes.intent_to_cater = 'RandomEventIntent';
                handlerInput.attributesManager.setSessionAttributes(attributes);
                return LaunchIntentHandler.handleLaunchRequest(handlerInput);

            }
            if(!attributes.events){
                // user has directly invoked this event without opening the skill
                // no previous data is present. we don't even know whether user is in db or not
                // hence forward this event to launch event and pass along an identifier suggesting the
                // original event to cater is a RandomEventIntent.
                attributes.intent_to_cater = 'RandomEventIntent';
                handlerInput.attributesManager.setSessionAttributes(attributes);
                return EventsIntent.handle(handlerInput);

            }
            else{

                console.log("Retrieved from Session: " + attributes.index);
                console.log("Retrieved from Session: " + attributes.events.count);
                let rand = Math.floor(Math.random() * (attributes.events.count > 9 ? 9 : attributes.events.count));
                console.log("Random event index: " + rand);

                attributes.index = rand;
                attributes.action_to_perform = ActionToPerform.EVENT_DETAILS;
                handlerInput.attributesManager.setSessionAttributes(attributes);

                let event = attributes.events.results[rand];
                var speech = new Speech();
                speech.say("Sure. This one looks interesting to me. ");
                speech.pause('1s');
                speech.say(Utils.getShortEventDescription(event) + ' ' + Utils.randomize(interesting));
                var speechOutput = speech.ssml(true);

                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt(messages.DETAILS_OR_NEXT_REPROMPT)
                    .getResponse();
                }

        }else{
            return handlerInput.responseBuilder
            .speak(messages.ERROR)
            .getResponse();
        }

    }
}

module.exports.EventsIntent = EventsIntent;
module.exports.NextEventIntent = NextEventIntent;
module.exports.PreviousEventIntent = PreviousEventIntent;
module.exports.RepeatEventIntent = RepeatEventIntent;
module.exports.DetailsEventIntent = DetailsEventIntent;
module.exports.RandomEventIntent = RandomEventIntent;

