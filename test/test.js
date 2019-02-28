var assert = require('assert');

describe('Test My Events skill', function(){

    let alexa;

    beforeEach(function(){
        const bvd = require('virtual-alexa');
        alexa = bvd.VirtualAlexa.Builder()
                            .handler('index.handler')
                            .interactionModelFile('./speechAssets/IntentSchema.json')
                            .create();
        alexa.dynamoDB().mock();
    });

    it('launches successfully', function(){

        alexa.filter((requestJson => {
            console.log("Request: " + JSON.stringify(requestJson));
            requestJson.context.System.user.permissions = {
                'consentToken' : 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJhdWQiOiJodHRwczovL2FwaS5hbWF6b25hbGV4YS5jb20iLCJpc3MiOiJBbGV4YVNraWxsS2l0Iiwic3ViIjoiYW16bjEuYXNrLnNraWxsLjY5ZjAzMWFlLWIwNGEtNDk0ZC1hYzMxLTYxNWEyOTk2MDAxZSIsImV4cCI6MTU1MDEyMTA3MiwiaWF0IjoxNTUwMTIwNzcyLCJuYmYiOjE1NTAxMjA3NzIsInByaXZhdGVDbGFpbXMiOnsiaXNEZXByZWNhdGVkIjoidHJ1ZSIsImNvbnNlbnRUb2tlbiI6IkF0emF8SXdFQklETFE0bTNaNlVyNExqenFyc1NQaU9STTh1X0FuRWRwVGIyX0djSlhEdnlsRXhTT0lmR3hCZ0NkaVVkTTBpRHYwXzZndDBsN3FzWWhYRkdzMV9yUGdCOGxhbGQ0QlNTTVRKVndUR3IxOFR1dW1CZzJCaG1GQk5MWC1GMWl6dWRKcklpekdaVTg2OVR3VG5fM2djbWRoQko2N0lBNThJZldJVy1KWmZrc1ZxQ2JoX3ZrV0UwcTRibVk2ZnZLN1F0bU1YcTBWM3lOMWNlWTdvaW5DV3RGOVdpUC1NbmtUMmNHN2x5aWI1SDg3bUUyWFR0UHFlbmRMVmZhaWFiQlZfc3BkR1Z6ZjQ3OXAxMzBHQkZTT0JNZmJFRDFrTGVPUXhSQzFLbWpGenhjMmt2dnl0WkFyX1UyNjdXV2NIY0xyelQtYkxzQkQ4UFptQ0xrR2xMcDZieTg3dFdVekJZbl9sSW9CWVh6OEx3NUU2Y3IwMWY1SmlleEhta1lNY1dlSGtjQUFmdHQwUm5UR2FFOVlNd25aRmpoWnhVMUk2MzFFbnhCU25DRUZCVmNkNUNtUHpMT1dodFZHeGp2N0dkYkVGemFGbENJN1RKMHFnVUpIcUlsMnQyd1loeHFZdjFJYTM5YU84cFZHdEdfZlRLYmpITFhDb1JRUGJZWkgxYzVEYWd5dEpiZW1hNnozODhHa3ZsMHJrYm9mTjJId2JBYnhVN3VFWFNORlFRcURncHNFZ1ZPcVg2WG9CWktYbDNySnJjaWlMYVA4N1pza2pJTEJXbi1UTTE0YkREVyIsImRldmljZUlkIjoiYW16bjEuYXNrLmRldmljZS5BRUxZTUZDSEdHWjJGU01IV0Q3TjdHS1NTUExHWFkyVFU0QUMyTUJTVFJTQlhQN0NKQzY1Wk5GNFk3SjRTR1RQTlNBWFlENkhRWlIzWDVUM0NaRlE3U0JJVlRNSEVJQk9OU1ZZUEFLRUdKVEhJTlJDNE1RVU5UUk5MTVVFRVZaVTVRNVFCTE9KT1E1U1pQTlhWMkRBREc1UTdMR0hIUVI3U1pWVk1LTkpMTkg3UUZQTTNLM0dLIiwidXNlcklkIjoiYW16bjEuYXNrLmFjY291bnQuQUhRTVpTR0FBNVVBSzdISUU1VlMyT0lXQlBSQVhTRk9ZR0g2NjZDUkVLTlBWREE0WENDMlZEWlVIMlNFMzQzQk1GWlRZSFlCUlJZSDZCN1kzU05TV1FFQlI0NlRON1JJSVBJVENNUUFBTVVTS0xUV05JM1ZWQTY1MkRaTVdJV1o2UkFOTE1IRUdVQ09MR0hIQVNPQjdDNlJSTU9HT0ZOTVFFT0pCMjVGQldBRUlTQlZLNlJZTklEUEhaRlZMWFRJSllWN0o1VElLQ0czVUlBIn19.lkOBam0230XAFfOaJbvFUM9lVRtKcFyeSIPlWegjAX3hruclcbPqa24t_3cajbMkV2wGE8e5eKcnarsuW5uqqDxhbYrfdbmROhBI1uVFgYVGx0Po4SlyZ2bzIRSyljvG-9huX9qWM7htI_FiwF5KpqnMWCmBu3A15igTEr2r5FPbGvqmYjvwtqYtRW_PqJhCwhjttKDgGNBRcE5WzgikXvXtCyelxj70RtLhqbSTRWHycI3CKKlWVKCRQMtoYgQNZuqFGKG5iQ6p_Op338zgOvsyJfgaQzZz-T2qj05gqPRQDy9XDcbxjYDBjKzTRH4ZY81CH4xwpuBlMXsPa1Py1A'
            }
            requestJson.context.System.user = {
                "userId": "amzn1.ask.account.d7fc466e-8200-4175-9e68-0d90920e15e5"
            }
        }));

        alexa.launch('open my events').then((speechResponse) => {

            console.log("Response: " + speechResponse.response.outputSpeech.ssml);
        });

    });

    // it('accepts correct city name from user', function(){

    //     alexa.utter('nagpur').then((speechResponse) => {

    //         console.log("Response: " + speechResponse.response.outputSpeech.ssml);
    //     });
    // });

    // it('fails to identify city name from user and reprompts', function(){

    //     alexa.utter('Kandiwa').then((speechResponse) => {

    //         console.log("Response: " + speechResponse.response.outputSpeech.ssml);

    //         alexa.utter('Kandiwali').then((speechResponse) => {

    //             console.log("Response: " + speechResponse.response.outputSpeech.ssml);

    //             alexa.utter('No').then((speechResponse) => {

    //                 console.log("Response: " + speechResponse.response.outputSpeech.ssml);
    //                 alexa.utter('Porbandar').then((speechResponse) => {

    //                     console.log("Response: " + speechResponse.response.outputSpeech.ssml);
    //                     alexa.utter('Yes').then((speechResponse) => {

    //                         console.log("Response: " + speechResponse.response.outputSpeech.ssml);
    //                     });
    //                 });
    //             });
    //         });

    //     });

    // });
});
