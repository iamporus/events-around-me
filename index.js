const Alexa = require('ask-sdk-core');
var https = require('https');

const messages = {
    WELCOME: 'Welcome to Events Around Me!  Would you like to see the events around you?',
    WHAT_DO_YOU_WANT: 'What do you want to ask?',
    NOTIFY_MISSING_PERMISSIONS: 'Please enable Location permissions in the Amazon Alexa app.',
    NO_ADDRESS: 'It looks like you don\'t have an address set. You can set your address from the companion app.',
    ADDRESS_AVAILABLE: 'Here is your full address: ',
    ERROR: 'Uh Oh. Looks like something went wrong.',
    LOCATION_FAILURE: 'There was an error with the Device Address API. Please try again.',
    GOODBYE: 'Bye! Thanks for using the Sample Device Address API Skill!',
    SEARCH_INITIATE: 'Great! Please wait till I search for events around you.',
    UNHANDLED: 'This skill doesn\'t support that. Please ask something else.',
    HELP: 'You can use this skill by asking something like: whats my address?',
    STOP: 'Bye! Thanks for using the Sample Device Address API Skill!',
    NAVIGATE_HOME: 'Bye! Thanks for using the Sample Device Address API Skill!'
  };

const PERMISSIONS = ['read::alexa:device:all:address:country_and_postal_code'];

const LaunchRequest = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
      console.log(handlerInput.requestEnvelope.session.user.userId);
      return handlerInput.responseBuilder.speak(messages.WELCOME)
        .reprompt(messages.WHAT_DO_YOU_WANT)
        .getResponse();
    },
  };

  const GetEventsAroundMe = {
    canHandle(handlerInput) {
      const { request } = handlerInput.requestEnvelope;

      return request.type === 'IntentRequest' && request.intent.name === 'GetEventsAroundMe';
    },

    async handle(handlerInput) {
      const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;

      // const response = await httpGet(address.postalCode);
          // console.log(response);

      return handlerInput.responseBuilder
      .speak("Sorry. I couldn't find any events near you. Try again tomorrow.")
      .getResponse();
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

        console.log('Address successfully retrieved, now responding to user.');

        if (address.addressLine1 === null && address.stateOrRegion === null) {
          response = responseBuilder.speak(messages.NO_ADDRESS).getResponse();
        } else {

          const response = await httpGet(address.postalCode);
          console.log(response);

          return handlerInput.responseBuilder
            .speak("Okay. Here is what I found about you. You live in " + response.results[0].formatted_address +
            ". Do you want me to look for events around you?")
            .getResponse();
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

  function httpGet(postalCode) {
    return new Promise(((resolve, reject) => {
      var options = {
          host: 'maps.googleapis.com',
          port: 443,
          path: '/maps/api/geocode/json?address='+postalCode+'&key=AIzaSyDRotqxlPDufHEJJzVaLxswP6uS71hCr5c',
          method: 'GET',
      };

      const request = https.request(options, (response) => {
        response.setEncoding('utf8');
        let returnData = '';

        response.on('data', (chunk) => {
          returnData += chunk;
        });

        response.on('end', () => {
          resolve(JSON.parse(returnData));
        });

        response.on('error', (error) => {
          reject(error);
        });
      });
      request.end();
    }));
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
      return GetAddressIntent.handle(handlerInput);
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