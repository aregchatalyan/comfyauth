const {validationResult} = require('express-validator');

const Support = require('../models/Support');

const errorHandler = require('../utils/errorHandler');

module.exports = {
    support: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({message: errors.array()[0].msg});
        }

        const message = new Support({name, email, text} = req.body);

        try {
            await message.save();

            res.status(201).json({message: 'Support message created'})
        } catch (e) {
            errorHandler(res, e);
        }
    }
}
