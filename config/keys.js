module.exports = {
    jwtSecret: 'Comfy Meet',

    mongoDB: {
        local: 'mongodb://localhost:27017/comfy',
        URI: 'mongodb+srv://***:***@cluster0-44jjq.mongodb.net/comfy'
    },

    email: {
        e_mail: 'progar1024@gmail.com',
        baseURL: 'http://localhost:5000',
        user: 'progar1024@gmail.com',
        pass: 'xccefzunotgxfocn'
    },

    sms: {
        accountSid: 'AC91bbe83798b4f63bf9368b88294a9b04',
        authToken: '7b9cb680c020ec0e50a619c779366f57',
        SMS: '+19382010309',
        WhatsApp: 'whatsapp:+14155238886'
    },

    google: {
        clientID: '331886037509-kesct9jhjt2cbp156t55hdfiu1tg7qb1.apps.googleusercontent.com',
        clientSecret: 'YML2ixu7c5hy2u46xhKOgUkB',
        callbackURL: 'http://localhost:5000/api/auth/google/callback',
        calendar: {
            clientID: '331886037509-gmtgmeojmjeip8d7ht01f0t00m4rkt7r.apps.googleusercontent.com',
            clientSecret: '6hXkbThBaGRqs3ELNEYsR_eq',
            refresh_token: '1//0433q0FDCM5DYCgYIARAAGAQSNwF-L9IrOIGiQzk71AolbzNHIWIt3EnRFIStO7dlcAAx-bJQU8HiiN9ZrCwwlQPM_vQtEs5xqQg'
        }
    },

    facebook: {
        clientID: '297884721311151',
        clientSecret: '2ddc916bd3c6f477b017d27054c8a168',
        callbackURL: 'http://localhost:5000/api/auth/facebook/callback'
    }
}
