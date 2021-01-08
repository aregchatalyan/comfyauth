const {validationResult} = require('express-validator');

const Contact = require('../models/Contact');

const errorHandler = require('../utils/errorHandler');

module.exports = {
    addContact: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({message: errors.array()[0].msg});
        }

        const {id} = req.user;
        const {first_name, last_name, phone, email, method} = req.body;

        if (!(first_name && last_name) || !(phone || email) || !method) {
            return res.status(403).json({message: 'All fields are required'});
        }

        const username = `${first_name} ${last_name}`;
        const by = phone || email.toLowerCase();

        try {
            const contactExist = await Contact.findOne({user: id});

            if (!contactExist) {
                const newContact = new Contact({
                    user: id,
                    contact: {username, by, method}
                }, {_id: 0});

                await newContact.save();

                res.status(201).json({message: 'Contact added'});
            } else {
                const preUpdate = await Contact.findOne({user: id, contact: {$elemMatch: {by}}});

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

    removeContact: async (req, res) => {
        const {id} = req.user;

        const {username, by} = req.body;

        try {
            const contactExist = await Contact.findOne({user: id, contact: {$elemMatch: {username, by}}});

            if (!contactExist) {
                return res.status(200).json({message: 'Contact does not exist'});
            }

            await Contact.updateOne({user: id, contact: {$elemMatch: {username, by}}}, {$pull: {contact: {username, by}}});

            res.status(200).json({message: 'Contact deleted!'});
        } catch (e) {
            errorHandler(res, e);
        }
    },

    getContacts: async (req, res) => {
        const {id} = req.user;

        try {
            const {contact} = await Contact.findOne({user: id});

            if (!contact.length) {
                return res.status(200).json({message: 'Contact list is empty'});
            }

            res.status(200).json({contacts: contact});
        } catch (e) {
            errorHandler(res, e);
        }
    }
}
