const crypto = require('crypto');
const {validationResult} = require('express-validator');

const {mailer, forgot} = require('../notifi/email');

const User = require('../models/User');

const errorHandler = require('../utils/errorHandler');

module.exports = {
    sendEmail: (req, res) => {
        try {
            crypto.randomBytes(3, async (err, buffer) => {
                if (err) {
                    return res.status(500).json({message: 'Something went wrong, try again later'});
                }

                const token = buffer.toString('hex');

                const user = await User.updateOne({email: req.body.email, method: 'local'}, {
                    resetToken: token,
                    resetTokenExp: Date.now() + 60 * 60 * 1000
                });

                if (!user.nModified) {
                    return res.status(400).json({message: 'User not found'});
                }

                await mailer.sendMail(forgot(req.body.email, token));

                res.status(200).json({message: 'Token sent'});
            });
        } catch (e) {
            errorHandler(res, e);
        }
    },

    resetCode: async (req, res) => {
        if (!req.body.token) {
            return res.status(403).json({message: 'Enter the code received by email'});
        }

        try {
            const user = await User.findOne({
                resetToken: req.body.token,
                resetTokenExp: {$gt: Date.now()}
            });

            if (!user) {
                return res.status(403).json({message: 'Incorrect code'});
            }

            res.status(200).json({userId: user._id.toString(), token: user.resetToken});
        } catch (e) {
            errorHandler(res, e);
        }
    },

    newPassword: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({message: errors.array()[0].msg});
        }

        try {
            const user = await User.updateOne({
                _id: req.body.userId,
                resetToken: req.body.token,
                resetTokenExp: {$gt: Date.now()},
                method: 'local'
            }, {
                password: req.body.password,
                $unset: {
                    resetToken: req.body.token,
                    resetTokenExp: {$gt: Date.now()}
                }
            });

            if (!user.nModified) {
                return res.status(403).json({message: 'Something went wrong, try again later'});
            }

            res.status(200).json({message: 'Password has been changed'});
        } catch (e) {
            errorHandler(res, e);
        }
    }
}
