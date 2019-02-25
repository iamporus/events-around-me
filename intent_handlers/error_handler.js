require('../constants.js');

const MissingPermissionsError = {
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
            .reprompt(messages.NEXT_REPROMPT)
            .getResponse();
    },
};

module.exports.MissingPermissionsError = MissingPermissionsError;