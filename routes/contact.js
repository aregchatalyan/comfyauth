const express = require('express');
const router = express.Router();
const passport = require('passport');

const controller = require('../controllers/contact');
const validator = require('../middleware/validators');

const passportJWT = passport.authenticate('jwt', {session: false});

router.patch('/add_contact', passportJWT, validator.addContact, controller.addContact);

router.patch('/remove_contact', passportJWT, controller.removeContact);

router.get('/get_contacts', passportJWT, controller.getContacts);

module.exports = router;
