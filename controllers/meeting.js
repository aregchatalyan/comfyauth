const crypto = require('crypto');
const moment = require('moment');
const {validationResult} = require('express-validator');
const {google: {calendar, auth: {OAuth2}}} = require('googleapis');

const {google: {calendar: {clientID, clientSecret, refresh_token}}} = require('../config/keys');

const User = require('../models/User');
const Contact = require('../models/Contact');
const Meeting = require('../models/Meeting');

const {sms} = require('../notifi/sms');
const {whatsapp} = require('../notifi/whatsapp');
const {mailer, meeting} = require('../notifi/email');

const oAuth2Client = new OAuth2(clientID, clientSecret);
oAuth2Client.setCredentials({refresh_token});

getCalendar = (auth) => calendar({version: 'v3', auth});

const errorHandler = require('../utils/errorHandler');

// 

module.exports = {
    scheduleMeet: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({message: errors.array()[0].msg});
        }

        const {id} = req.user;
        const {date, name, meeting_id, waiting_room, require_password, password, sync_with} = req.body;

        const calendar = getCalendar(oAuth2Client);

        const start = new Date(date);
        const end = new Date(date);
        end.setDate(start.getDate() + 3);

        try {
            await calendar.events.insert({
                calendarId: 'primary',
                resource: {
                    summary: name,
                    location: 'Comfy Meeting',
                    start: {
                        dateTime: start.toISOString(),
                        timezone: moment.tz.guess()
                    },
                    end: {
                        dateTime: end.toISOString(),
                        timezone: moment.tz.guess()
                    },
                    reminders: {
                        useDefault: false,
                        overrides: [
                            {method: 'email', minutes: 24 * 60},
                            {method: 'popup', minutes: 30}
                        ],
                    },
                }
            });

            await calendar.events.list({
                calendarId: 'primary',
                timeMin: new Date(1970, 1, 1).toISOString(),
                orderBy: 'updated'
            }, async (err, doc) => {
                if (err) throw err;

                const {items} = doc.data;

                const event_id = items[items.length - 1].id;

                const meeting = new Meeting({
                    user: id,
                    date: {
                        startTime: start.toISOString(),
                        endTime: end.toISOString(),
                        timezone: moment.tz.guess()
                    },
                    name, meeting_id, event_id, waiting_room, require_password, password, sync_with
                });

                await meeting.save();
            });

            res.status(201).json({message: 'Meeting created'});
        } catch (e) {
            errorHandler(res, e);
        }
    },

    updateMeet: async (req, res) => {
        const {id} = req.user;
        const {date, name, meeting_id, event_id, waiting_room, require_password, password, sync_with} = req.body;

        const calendar = getCalendar(oAuth2Client);

        const start = new Date(date);
        const end = new Date(date);
        end.setDate(start.getDate() + 3);

        try {
            await calendar.events.update({
                calendarId: 'primary',
                eventId: event_id,
                resource: {
                    summary: name,
                    start: {dateTime: start.toISOString()},
                    end: {dateTime: end.toISOString()}
                },
            }, null, async (err) => {
                if (err) {
                    return res.status(403).json({message: err.message});
                }

                await Meeting.updateOne({user: id, event_id}, {
                    date: {
                        startTime: start.toISOString(),
                        endTime: end.toISOString(),
                        timezone: moment.tz.guess()
                    },
                    name, meeting_id, waiting_room, require_password, password, sync_with
                });

                res.status(200).json({message: 'Meeting updated'});
            });
        } catch (e) {
            errorHandler(res, e);
        }
    },

    removeMeet: async (req, res) => {
        const {id} = req.user;
        const {event_id} = req.query;

        const calendar = getCalendar(oAuth2Client);

        try {
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: event_id
            }, null, async (err) => {
                if (err) {
                    return res.status(404).json({message: err.message});
                }

                await Meeting.deleteOne({user: id, event_id});

                res.status(200).json({message: 'Event removed'});
            });
        } catch (e) {
            errorHandler(res, e)
        }
    },

    searchComfyUser: async (req, res) => {
        const {search} = req.body;

        if (!search) {
            return res.status(200).json({message: 'Who are we looking for?'});
        }

        try {
            const users = await User.find({}).select('username email method');

            const searching = (users, search) => users.filter((user) => (user.username.toLowerCase().indexOf(search.toLowerCase()) > -1));

            const searchResult = searching(users, search);

            if (!searchResult.length) {
                return res.status(200).json({message: 'Nobody was found'});
            }

            res.status(200).json({searchResult});
        } catch (e) {
            errorHandler(res, e);
        }
    },

    addContact: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({message: errors.array()[0].msg});
        }

        const {id} = req.user;
        let {username, first_name, last_name, phone, email, method} = req.body;

        if (!(username || first_name && last_name) || !(phone || email) || !method) {
            return res.status(403).json({message: 'All fields are required'});
        }

        if (!username) {
            username = `${first_name} ${last_name}`;
        }

        const by = phone || email.toLowerCase();

        try {
            const contactExist = await Contact.findOne({user: id}, {
                contact: {$elemMatch: {by}}
            });

            if (!contactExist) {
                const newContact = new Contact({
                    user: id,
                    contact: {username, by, method}
                }, {_id: 0});

                await newContact.save();

                res.status(201).json({message: 'Contact added'});
            } else {
                const preUpdate = await Contact.findOne({user: id, 'contact.by': by});

                if (preUpdate) {
                    return res.status(200).json({message: 'A contact already exists on your list'});
                }

                await Contact.updateOne({user: id}, {
                    $addToSet: {contact: {username, by, method}}
                });

                res.status(200).json({message: 'Contacts list updated'});
            }
        } catch (e) {
            errorHandler(res, e);
        }
    },

    sendInvite: async (req, res) => {
        const {id} = req.user;

        const url = 'http://localhost:5000/accepting/';

        try {
            const contactsExist = await Contact.findOne({user: id}).select('contact');

            if (!contactsExist) {
                return res.status(200).json({message: 'You have not added any contacts'});
            }

            const {contact} = contactsExist;

            for await (let person of contact) {
                crypto.randomBytes(3, async (err, buffer) => {
                    const token = buffer.toString('hex');

                    switch (person.method) {
                        case ('phone') :
                            await Contact.updateOne({
                                contact: {$elemMatch: {username: person.username, by: person.by, method: 'phone'}}
                            }, {'contact.$.accept_code': token});
                            sms(url, '+37498026262');
                            break;

                        case ('whatsapp') :
                            await Contact.updateOne({
                                contact: {$elemMatch: {username: person.username, by: person.by, method: 'whatsapp'}}
                            }, {'contact.$.accept_code': token});
                            whatsapp(url, 'whatsapp:+37498026262');
                            break;

                        case ('email') :
                            await Contact.updateOne({
                                contact: {$elemMatch: {username: person.username, by: person.by, method: 'email'}}
                            }, {'contact.$.accept_code': token});
                            await mailer.sendMail(meeting(person.by, url, token));
                            break;

                        case ('local') :
                            await Contact.updateOne({
                                contact: {$elemMatch: {username: person.username, by: person.by, method: 'local'}}
                            }, {'contact.$.accept_code': token});
                            await mailer.sendMail(meeting(person.by, url, token));
                            break;

                        case ('google') :
                            await Contact.updateOne({
                                contact: {$elemMatch: {username: person.username, by: person.by, method: 'google'}}
                            }, {'contact.$.accept_code': token});
                            await mailer.sendMail(meeting(person.by, url, token));
                            break;

                        case ('facebook') :
                            await Contact.updateOne({
                                contact: {$elemMatch: {username: person.username, by: person.by, method: 'facebook'}}
                            }, {'contact.$.accept_code': token});
                            await mailer.sendMail(meeting(person.by, url, token));
                            break;
                    }
                });
            }

            res.status(200).json({contact});
        } catch (e) {
            errorHandler(res, e);
        }
    },

    acceptInvite: async (req, res) => {
        const {id} = req.user;
        const {accept_code} = req.body;

        if (!accept_code) {
            return res.status(200).json({message: 'The user did not accept the invitation'});
        }

        const calendar = getCalendar(oAuth2Client);

        try {
            const meet = await Meeting.findOne({user: id});

            if (!meet) {
                return res.status(200).json({message: 'No scheduled meets found'});
            }

            const {contact} = await Contact.findOne({user: id}, {contact: {$elemMatch: {accept_code}}});

            if (!contact.length) {
                return res.status(200).json({message: 'Something is wrong, please try later'});
            }

            const {_id, username, by, method} = contact[0];

            await Meeting.updateOne({user: id}, {$addToSet: {contact: {_id, username, by, method}}});


            if (method === 'email' || method === 'local' || method === 'google' || method === 'facebook') {
                const {event_id, contact} = await Meeting.findOne({user: id});

                const attendees = [];

                for (let item of contact) {
                    attendees.push({email: item.by})
                }

                await calendar.events.patch({
                    calendarId: 'primary',
                    eventId: event_id,
                    resource: {attendees},
                })
            }

            await Contact.updateOne({$and: [{user: id}, {'contact.accept_code': accept_code}]}, {$unset: {'contact.$.accept_code': accept_code}});

            res.status(200).json({meet, message: 'Users, who approved the invitation'});
        } catch (e) {
            errorHandler(res, e);
        }
    },

    getMeetings: async (req, res) => {
        const {id} = req.user;

        try {
            const meetings = await Meeting.find({user: id});

            if (!meetings.length) {
                return res.status(200).json({message: 'Contact list is empty'});
            }

            res.status(200).json({meetings});
        } catch (e) {
            errorHandler(res, e);
        }
    }
}

// getCalendar(oAuth2Client).events.list({
//     calendarId: 'primary',
//     // eventId: ''
// }).then(event => console.log(event.data.items));
