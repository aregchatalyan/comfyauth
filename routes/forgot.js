const express = require('express');
const router = express.Router();

const controller = require('../controllers/forgot');
const validator = require('../middleware/validators');

router.patch('/reset', controller.sendEmail);

router.post('/code', controller.resetCode);

router.patch('/password/', validator.newPassword, controller.newPassword);

module.exports = router;
