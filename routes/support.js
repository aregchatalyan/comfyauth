const express = require('express');
const router = express.Router();

const controller = require('../controllers/support');
const validator = require('../middleware/validators');

router.post('/support_message', validator.support, controller.support);

module.exports = router;
