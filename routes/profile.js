const express = require('express');
const router = express.Router();
const passport = require('passport');

const upload = require('../middleware/upload');
const controller = require('../controllers/profile');
const validator = require('../middleware/validators');

const passportJWT = passport.authenticate('jwt', {session: false});

router.patch('/photo', passportJWT, upload.single('thumbnail'), controller.uploadPhoto);
router.patch('/remove_photo', passportJWT, controller.removePhoto);

router.patch('/edit', passportJWT, validator.editUser, controller.editUser);

router.patch('/change_password', passportJWT, validator.changePassword, controller.changePassword);

router.get('/unlink', passportJWT, controller.removeUser);

module.exports = router;
