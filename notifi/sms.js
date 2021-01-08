const {sms: {accountSid, authToken, SMS}} = require('../config/keys');

const client = require('twilio')(accountSid, authToken);

module.exports.sms = (text, phone) => {
    client.messages.create({
        body: text,
        from: SMS,
        to: phone
    }).then(message => console.log(message.sid));
}
