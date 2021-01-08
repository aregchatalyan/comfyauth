const express = require('express');
const router = express.Router();
const passport = require('passport');

const controller = require('../controllers/auth');
const validator = require('../middleware/validators');

require('../middleware/passport');

const passportJWT = passport.authenticate('jwt', {session: false});

router.get('/', (req, res) => res.json({message: 'Home Page'}));

router.post('/register', validator.register, controller.register);

router.post('/login', controller.login);

router.get('/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    successRedirect: 'http://localhost:3000/profile',
    failureRedirect: 'http://localhost:3000',
    accessType: 'offline', approvalPrompt: 'force'
}));
router.get('/google/callback', passport.authenticate('google'), controller.google);

router.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));
router.get('/facebook/callback', passport.authenticate('facebook'), controller.facebook);

router.get('/me', passportJWT, controller.me);

router.get('/logout', passportJWT, controller.logout);

module.exports = router;
