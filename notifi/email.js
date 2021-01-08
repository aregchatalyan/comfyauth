const nodemailer = require('nodemailer');

const {email: {user, pass, e_mail, baseURL}} = require('../config/keys');

module.exports = {
    mailer: nodemailer.createTransport({
        service: 'gmail',
        auth: {user, pass},
        tls: {rejectUnauthorized: false}
    }),

    register: (email) => {
        return {
            to: email,
            from: e_mail,
            subject: 'Account created',
            html: `
            <h1>Welcome to Comfy</h1>
            <p>Your ${email} account successfully created</p>
            <hr />
            <a href="${baseURL}">Comfy</a>`
        }
    },

    forgot: (email, token) => {
        return {
            to: email,
            from: e_mail,
            subject: 'Reset password',
            html: `
            <h1>Forgot password?</h1>
            <p>If not, ignore this email.</p>
            <p>Otherwise, this your password reset code - ${token}</p> 
            <p>click on the link below:</p>
            <p><a href="${baseURL}/api/auth/code">Reset</a></p>
            <hr />
            <a href="${baseURL}">Comfy</a>`
        }
    },

    meeting: (email, url, token) => {
        return {
            to: email,
            from: e_mail,
            subject: 'Meeting request',
            html: `
            <h1>Accept meeting request</h1>
            <p>Please follow the link to accept the conference invitation ${url}</p>
            <hr />
            <a href="${baseURL}">Comfy</a>`
        }
    }
}