const express = require('express');
const router = express.Router();
const passport = require('passport');

const controller = require('../controllers/meeting');
const validator = require('../middleware/validators');

const passportJWT = passport.authenticate('jwt', {session: false});

router.post('/schedule_meeting', passportJWT, validator.scheduleMeet, controller.scheduleMeet);

router.get('/search', passportJWT, controller.searchComfyUser);

router.patch('/add_contact', passportJWT, validator.addContact, controller.addContact);

router.patch('/invite', passportJWT, controller.sendInvite);

router.patch('/accept_meet', passportJWT, controller.acceptInvite);

router.patch('/edit_meeting', passportJWT, controller.updateMeet);

router.delete('/remove_meeting', passportJWT, controller.removeMeet);

router.get('/get_meetings', passportJWT, controller.getMeetings);

module.exports = router;
