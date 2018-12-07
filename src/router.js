const Router = require ('express').Router;

const {registerBind, sendNotification} = require ('./notification_handler');
const tokenGenerator = require ('./token_generator');
const config = require ('./config');
const axios = require ('axios');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require ('twilio') (accountSid, authToken);
const router = new Router ();

const servicesSID = process.env.TWILIO_CHAT_SERVICE_SID;
const chatChannel = process.env.TWILIO_CHAT_CHANNEL;

// Convert keys to camelCase to conform with the twilio-node api definition contract
const camelCase = require ('camelcase');
function camelCaseKeys (hashmap) {
  var newhashmap = {};
  Object.keys (hashmap).forEach (function (key) {
    var newkey = camelCase (key);
    newhashmap[newkey] = hashmap[key];
  });
  return newhashmap;
}

router.get ('/token/:id?', (req, res) => {
  const id = req.params.id;
  res.send (tokenGenerator (id));
});

router.post ('/token', (req, res) => {
  const id = req.body.id;
  res.send (tokenGenerator (id));
});

router.post ('/sms', (req, res) => {
  var content = req.body.Body;
  client.chat.services.each (services => console.log (services.sid));
  client.chat
    .services (servicesSID)
    .channels (chatChannel)
    .messages.create ({from: 'Agent', body: content})
    .then (message => console.log (message))
    .catch (e => console.log (e))
    .done ();
});

router.post ('/register', (req, res) => {
  var content = camelCaseKeys (req.body);
  registerBind (content).then (data => {
    res.header ('Access-Control-Allow-Origin', '*');
    res.status (data.status);
    res.send (data.data);
  });
});

router.post ('/send-notification', (req, res) => {
  var content = camelCaseKeys (req.body);

  sendNotification (content).then (data => {
    res.status (data.status);
    res.send (data.data);
  });
});

router.get ('/config', (req, res) => {
  res.json (config);
});

//Create a facebook-messenger binding based on the authentication webhook from Facebook
router.post ('/messenger_auth', function (req, res) {
  //Extract the request received from Facebook
  const message = req.body.entry[0].messaging[0];
  console.log (message);
  // Set user identity using their fb messenger user id
  const identity = message.sender.id;
  //Let's create a new facebook-messenger Binding for our user
  const binding = {
    identity: identity,
    BindingType: 'facebook-messenger',
    Address: message.sender.id,
  };
  registerBind (camelCaseKeys (binding)).then (data => {
    res.status (data.status);
    res.send (data.data);
  });
});

//Verification endpoint for Facebook needed to register a webhook.
router.get ('/chat_variables', function (req, res) {
  res.send ({
    ACCOUNT: process.env.TWILIO_ACCOUNT_SID,
    TOKEN: process.env.TWILIO_AUTH_TOKEN,
    FROM: process.env.TWILIO_FROM,
    TO: process.env.TWILIO_TO
  });
});

//Verification endpoint for Facebook needed to register a webhook.
router.get ('/messenger_auth', function (req, res) {
  console.log (req.query['hub.challenge']);
  res.send (req.query['hub.challenge']);
});

module.exports = router;
