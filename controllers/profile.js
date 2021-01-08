const fs = require('fs');
const moment = require('moment');
const CronJob = require('cron').CronJob;
const {validationResult} = require('express-validator');

const User = require('../models/User');

const errorHandler = require('../utils/errorHandler');

module.exports = {
    uploadPhoto: async (req, res) => {
        if (!req.file) {
            return res.status(422).json({message: 'Choose file'});
        }

        const {email, thumbnail, method} = req.user;

        try {
            await User.updateOne({email, method}, {
                thumbnail: req.file.path
            });

            if (thumbnail && thumbnail.length === 70) {
                fs.unlink(thumbnail, (err) => {
                    if (err) throw err;
                });
            }

            res.status(200).json({message: 'Photo saved'});
        } catch (e) {
            errorHandler(res, e);
        }
    },

    removePhoto: async (req, res) => {
        if (!fs.existsSync(`uploads/${req.user.id}/`)) {
            return res.status(404).json({message: 'No photo to remove'});
        }

        const {id, email, thumbnail, method} = req.user;

        try {
            await User.updateOne({email, method}, {$unset: {thumbnail}});

            fs.rmdir(`uploads/${id}`, {recursive: true}, (err) => {
                if (err) throw err;
            });

            res.status(200).json({message: 'Photo removed'});
        } catch (e) {
            errorHandler(res, e);
        }
    },

    editUser: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({message: errors.array()[0].msg});
        }

        if (req.user.method !== 'local') {
            return res.status(403).json({message: 'You cannot edit this type of account'});
        }

        const {username, phone, email} = req.user;

        try {
            await User.updateOne({email, method: 'local'}, {
                username: req.body.username || username,
                phone: req.body.phone || phone,
                email: req.body.email || email
            });

            res.status(200).json({message: 'User data saved'});
        } catch (e) {
            errorHandler(res, e);
        }
    },

    changePassword: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({message: errors.array()[0].msg});
        }

        if (req.user.method !== 'local') {
            return res.status(403).json({message: 'You cannot edit this type of account'});

        }

        const {email} = req.user;
        const {old_password, new_password} = req.body;

        try {
            const editedUser = await User.findOne({email, method: 'local'});

            const isMatch = await editedUser.validPassword(old_password);

            if (!isMatch) {
                return res.status(400).json({message: 'Password data incorrect'});
            }

            await User.updateOne({email, method: 'local'}, {
                password: new_password
            });

            res.status(200).json({message: 'Password changed'});
        } catch (e) {
            errorHandler(res, e);
        }
    },

    removeUser: async (req, res) => {
        const d = new Date();
        d.setDate(new Date().getDate() + 30);
        const timezone = moment.tz.guess();

        const user = req.user;

        try {
            const job = new CronJob(`* * * ${d.getDate()} ${d.getMonth() + 1} *`, async () => {
                await user.remove();

                if (user.thumbnail && user.thumbnail.length === 70) {
                    fs.rmdir(`uploads/${user.id}`, {recursive: true}, (err) => {
                        if (err) throw err;
                    });
                }

                job.stop();
            }, null, true, timezone);

            job.start();

            res.status(200).json({message: `Your account will be deleted at ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`});
        } catch (e) {
            errorHandler(res, e);
        }
    }
}
