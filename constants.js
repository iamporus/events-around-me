global.messages =
{
    WELCOME: 'Welcome to My Events. Here you can find all the action happening in your neighborhood.'
    + ' Like concerts, plays, exhibitions, sports events and many more. For that, I need to know the zip code of your area, '
    + 'so that I can find the nearest events around you. Also, I can create reminders for all those interesting events around you so that you don\'t miss any of them.' 
    + ' So, please proceed to the Amazon Alexa companion app and enable location and reminders permissions for My Events.',
    WELCOME_BACK: 'Welcome back to My Events! Here are some events that you might be interested in.',
    WHAT_DO_YOU_WANT: 'What do you want to ask?',
    NOTIFY_MISSING_PERMISSIONS: 'Uh Oh. Looks like you haven\'t enabled Location or Reminders permissions for me yet. Please proceed to the Amazon Alexa app and enable Location and Reminder permissions for My Events skill.' 
    + ' You can open this skill later on by saying, Alexa, open My Events.',
    NO_ADDRESS: 'It looks like you don\'t have an address set. You can set your address from the companion app.',
    ERROR: 'Uh Oh. Looks like something went wrong.',
    ERROR_NO_EVENTS_FOUND: 'Uh Oh. I don\'t have any events with me right now. Do you want me to search for events around you?',
    LOCATION_FAILURE: 'There was an error while creating a reminder. Please try again. You can say Next to hear the next one OR say Stop to quit.',
    GOODBYE: 'Alright! Have a fun.',
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
    NO_REMINDER_PROMT: 'Okay. ' + 'You can say Next to hear the next one OR say Stop to quit.'
  };

global.PERMISSIONS = ['read::alexa:device:all:address:country_and_postal_code', 'alexa::alerts:reminders:skill:readwrite'];
global.CATEGORIES = 'concerts,sports,festivals,performing-arts';
