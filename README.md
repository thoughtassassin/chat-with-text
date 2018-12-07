I modified the starter to allow chat to communicate with a phone. Set up an .env file with the following values:

TWILIO_ACCOUNT_SID=[your SID]  
TWILIO_API_KEY=[your API_KEY]  
TWILIO_API_SECRET=[your SECRET]  
TWILIO_CHAT_SERVICE_SID=[your SERVICE_SID]  
TWILIO_AUTH_TOKEN=[your AUTH_TOKEN]  
TWILIO_CHAT_CHANNEL=[your CHAT_CHANNEL]  

Once you have that set up, log into your Twilio dashboard and set up the callback for your phone number. You will have to set up a Twilio phone number. Then when you go to your Active Numbers you can set the callback for the phone number. You will want it to be [domain.your.service]/sms. That will send the response to the sms endpoint of the Node server. That is all you should need.