const Alexa = require('ask-sdk-core');

require('./constants.js');
const LocationHelper = require('./location_helper.js');
const EventsHelper = require('./events_helper.js');

var credentials = {
  accessKeyId: 'AKIAI423S3JQDTU5YH5Q',
  secretAccessKey: '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',
  region: 'ap-northeast-1'
};

var dynasty = require('dynasty')(credentials);
var users = dynasty.table('events_user_info');

const LaunchRequest = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {

      const userid = handlerInput.requestEnvelope.session.user.userId;
      console.log("User Id is : " + userid);

    return new Promise((resolve, reject) =>
    {
      users.find( userid ).then(function(user)
      {
          if(user)
          {
            console.log("Yeah. User exists. Directly show the events around him. ");

            let response = GetEventsAroundMeInstant.handle(handlerInput);
            resolve(response);
          }
          else
          {
            console.log("Error. User does not exist. ");
            console.log("Creating new user...");

            users.insert({ 'userid': userid }).then(function(resp)
            {
                console.log(resp);
                let response = handlerInput.responseBuilder
                                .speak(messages.WELCOME)
                                .getResponse();
                resolve(response);
            });
          }
      });
    });
  }
}

  const GetEventsAroundMe = {
    canHandle(handlerInput) {
      const { request } = handlerInput.requestEnvelope;

      return request.type === 'IntentRequest' && request.intent.name === 'GetEventsAroundMe';
    },

    async handle(handlerInput) {

      const response = await EventsHelper.getEventsAroundUser(1,2);
      if(response.count > 0)
      {
          console.log("Events around me: " + response.count);

          return handlerInput.responseBuilder
          .speak("I found more than 5 events around you. Here's the first one. " + response.results[0].title
          + "You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
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


  const GetEventsAroundMeInstant = {
    canHandle(handlerInput) {
      const { request } = handlerInput.requestEnvelope;

      return request.type === 'IntentRequest' && request.intent.name === 'GetEventsAroundMeInstant';
    },

    async handle(handlerInput) {

      const response = await EventsHelper.getEventsAroundUser(1,2);
      if(response.count > 0)
      {
        console.log("Events around me: " + response.count);
          return handlerInput.responseBuilder
          .speak("I found several events around you. Here's the first one. " + response.results[0].title
          + ". You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
          .reprompt("You can say 'Tell me details' to get details about this event or say Next to hear the next one.")
          .getResponse();
      }
      else
      {
        return handlerInput.responseBuilder
          .speak("Sorry. I could not find any events around you. Looks like everybody is busy in their day jobs.")
          .reprompt("You can say 'Tell me events from other cities'.")
          .getResponse();
      }
    }
  }

const GetAddressIntent = {
    canHandle(handlerInput) {
      const { request } = handlerInput.requestEnvelope;

      return request.type === 'IntentRequest' && request.intent.name === 'GetAddressIntent';
    },
    async handle(handlerInput) {
      const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;

      const consentToken = requestEnvelope.context.System.user.permissions
        && requestEnvelope.context.System.user.permissions.consentToken;
      if (!consentToken) {
        return responseBuilder
          .speak(messages.NOTIFY_MISSING_PERMISSIONS)
          .withAskForPermissionsConsentCard(PERMISSIONS)
          .getResponse();
      }
      try {
        const { deviceId } = requestEnvelope.context.System.device;
        const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
        const address = await deviceAddressServiceClient.getCountryAndPostalCode(deviceId);
        const userid = handlerInput.requestEnvelope.session.user.userId;

        console.log('Address successfully retrieved, now responding to user.');

        if (address.addressLine1 === null && address.stateOrRegion === null) {
          response = responseBuilder.speak(messages.NO_ADDRESS).getResponse();
        } else {

          console.log("Pincode: " + address.postalCode);
          const user_address = await LocationHelper.getLatLongFromPostalCode(address.postalCode);
          console.log("Here is the complete address: "+ user_address);

          return new Promise((resolve, reject) =>
          {
            users.find( userid ).then(function(user)
            {
                if(!user)
                {
                  console.log("Error. User does not exist. ");
                  console.log("Creating new user...");

                  users.insert({ 'userid': userid }).then(function(resp)
                  {
                      saveUserAddress(userid, user_address, address.postalCode);

                      let response = handlerInput.responseBuilder
                      .speak("Okay. Here is what I found about you. You live in " + user_address.results[0].formatted_address +
                      ". Do you want me to look for events around you?")
                      .reprompt("Do you want me to look for events around you?")
                      .getResponse();
                      resolve(response);
                  });
                }
                else
                {
                  saveUserAddress(userid, user_address, address.postalCode)

                  let response = handlerInput.responseBuilder
                  .speak("Okay. Here is what I found about you. You live in " + user_address.results[0].formatted_address +
                  ". Do you want me to look for events around you?")
                  .reprompt("Do you want me to look for events around you?")
                  .getResponse();;
                  resolve(response);
                }

            });
          });
        }

      } catch (error) {
        if (error.name !== 'ServiceError') {
          const response = responseBuilder.speak(messages.ERROR).getResponse();
          return response;
        }
        throw error;
      }
    },
  };

  function saveUserAddress(userid, userAddress, postalCode)
  {
      var lat = userAddress.results[0].geometry.location.lat;
      var lng = userAddress.results[0].geometry.location.lng;

      console.log("lat: "  + lat);
      console.log("lng: "  + lng);

      users.update(userid, { 'pincode':postalCode,
      'lat':lat,
      'lng':lng }).then(function(resp)
      {
        console.log(resp);
        console.log("Saved address details in db successfully.");
      });
  }

  const SessionEndedRequest = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
      console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

      return handlerInput.responseBuilder.getResponse();
    },
  };

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

      //Get user address first as it is necessary to fetch events around him.
      return GetEventsAroundMe.handle(handlerInput);
    },
  };

  const CancelIntent = {
    canHandle(handlerInput) {
      const { request } = handlerInput.requestEnvelope;

      return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent';
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak(messages.GOODBYE)
        .getResponse();
    },
  };

  const NoIntent = {
    canHandle(handlerInput) {
      const { request } = handlerInput.requestEnvelope;

      return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak(messages.GOODBYE)
        .getResponse();
    },
  };

  const StopIntent = {
    canHandle(handlerInput) {
      const { request } = handlerInput.requestEnvelope;

      return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak(messages.STOP)
        .getResponse();
    },
  };

const GetAddressError = {
    canHandle(handlerInput, error) {
      return error.name === 'ServiceError';
    },
    handle(handlerInput, error) {
      if (error.statusCode === 403) {
        return handlerInput.responseBuilder
          .speak(messages.NOTIFY_MISSING_PERMISSIONS)
          .withAskForPermissionsConsentCard(PERMISSIONS)
          .getResponse();
      }
      return handlerInput.responseBuilder
        .speak(messages.LOCATION_FAILURE)
        .reprompt(messages.LOCATION_FAILURE)
        .getResponse();
    },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    GetAddressIntent,
    GetEventsAroundMe,
    GetEventsAroundMeInstant,
    SessionEndedRequest,
    HelpIntent,
    CancelIntent,
    YesIntent,
    StopIntent,
    NoIntent,
    UnhandledIntent
  )
  .addErrorHandlers(GetAddressError)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();