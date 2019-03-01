global.messages =
{
    WELCOME: 'Welcome to My Events. Here you can find all the action happening in your neighborhood.'
    + ' Like concerts, plays, exhibitions, sports events and many more. To find the closest events happening around you, can you please tell me the city where you live?',
    WELCOME_BACK: 'Welcome back to My Events! Here are some events that you might be interested in.',
    WHAT_DO_YOU_WANT: 'What do you want to ask?',
    NOTIFY_MISSING_PERMISSIONS: 'Oh. Before I could create a reminder, it is necessary for me to get the reminder permissions from you. ' +
    'So, please proceed to the Amazon Alexa companion app and enable reminders permissions for My Events skill. ' +
    'Don\'t worry. This is one time thing only.' + ' You can open this skill later on by saying, Alexa, open My Events.',
    NO_ADDRESS: 'It looks like you don\'t have an address set. You can set your address from the companion app.',
    ERROR: 'Uh Oh. Looks like something went wrong.',
    ERROR_NO_EVENTS_FOUND: 'Uh Oh. I don\'t have any events with me right now. Do you want me to search for events around you?',
    LOCATION_FAILURE: 'There was an error while creating a reminder. Please try again. You can say Next to hear the next one OR say Stop to quit.',
    GOODBYE: 'Alright! Have fun.',
    UNHANDLED: 'Sorry. I don\'t know that one. Please ask me something else.',
    HELP: 'Okay. Here are some phrases that you can say to me. Say, \'What\'s happening on friday?\', to get events on coming Friday. You can say any day of the week. '
    +'Say, \'Tell me all the events\', to get all the events in next 7 days. Say, Tell me details, to get details about a particular event. Say, Remind me, to remind you about that event an hour before it starts.',
    STOP: 'Okay!',
    NAVIGATE_HOME: 'Bye! Thanks for using My Events!',
    DETAILS_OR_NEXT_REPROMPT: "You can say \'Tell me details\' or say Next to hear the next one.",
    NEXT_REPROMPT: "You can say Next to hear the next one OR say Stop to quit.",
    DETAILS_OR_APP: 'That\'s it. You can say \'Tell me details\' to know more about the events.',
    NO_REMINDER: 'OK, I won\'t remind you.',
    REMINDER_CREATED: 'Okay. I will remind you about this event an hour before it starts. ',
    REMINDER_PROMT: 'Would you like me to remind you about this event an hour before it starts? ',
    NO_REMINDER_PROMT: 'Okay. ' + 'You can say Next to hear the next one OR say Stop to quit.',
    REPEAT_CITY_NAME: 'Oh. Let\'s give it another try. Can you tell me the name of your city once again?',
    REPEAT_CITY_NAME_RE: 'Can you please tell me the name of your city once again?',
    CHANGE_CITY: 'Okay. Do you want me to look for events in some other city?',
    CHANGE_CITY_RE: 'Do you want me to look for events in some other city?',
    NEW_CITY: 'Great. Which city are you interested in?',
    NEW_CITY_RE: 'Which city are you interested in?',
    INTERESTING_RE: 'Does this event sound interesting?'
  };

global.interesting = [ 'Does this event sound interesting?', 'Does this looks interesting?', 'Want to know more about it?', 'Should I tell you more about this one?']
global.fetchNextThree = [ 'Okay. Should I tell you few more events?', 'Do you want to listen to more events?', 'Want to know more such events?', 'Do you want me to continue with the events?']

global.PERMISSIONS = ['alexa::alerts:reminders:skill:readwrite'];
global.CATEGORIES = 'concerts,sports,festivals,performing-arts';

global.ActionToPerform = {

  EVENT_LOOKUP_DEFAULT_CITY: 0,
  EVENT_LOOKUP_NEW_CITY: 1,
  CONFIRM_NEW_CITY: 2,
  CREATE_REMINDER: 3,
  EVENT_DETAILS: 4,
  FETCH_MORE_EVENTS: 5,
  REPEAT_EVENTS: 6

};