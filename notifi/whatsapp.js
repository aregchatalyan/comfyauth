const {sms: {accountSid, authToken, WhatsApp}} = require('../config/keys');

const client = require('twilio')(accountSid, authToken);

module.exports.whatsapp = (text, phone) => {
    client.messages.create({
        body: text,
        from: WhatsApp,
        to: phone
    }).then(message => console.log(message.sid));
}

