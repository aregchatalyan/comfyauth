module.exports = {
    jwtSecret: 'Comfy Meet',

    mongoDB: {
        local: 'mongodb://localhost:27017/comfy',
        URI: ''
    },

    email: {
        e_mail: '',
        baseURL: '',
        user: '',
        pass: ''
    },

    sms: {
        accountSid: '',
        authToken: '',
        SMS: '',
        WhatsApp: ''
    },

    google: {
        clientID: '',
        clientSecret: '',
        callbackURL: '',
        calendar: {
            clientID: '',
            clientSecret: '',
            refresh_token: ''
        }
    },

    facebook: {
        clientID: '',
        clientSecret: '',
        callbackURL: ''
    }
}
