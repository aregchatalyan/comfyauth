const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');

const {jwtSecret} = require('../config/keys');

const User = require('../models/User');

const errorHandler = require('../utils/errorHandler');

signToken = (user) => {
    return jwt.sign({
        sub: user.id,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 1)
    }, jwtSecret);
}

module.exports = {
    register: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({message: errors.array()[0].msg});
        }

        const {username, phone, email, password} = req.body;

        try {
            const candidate = await User.findOne({email, method: 'local'});

            if (candidate) {
                return res.status(409).json({message: 'User exists, please login'});
            }

            const user = new User({username, phone, email, password, method: 'local'});

            await user.save();

            res.status(201).json({message: 'User created'});
        } catch (e) {
            errorHandler(res, e);
        }
    },

    login: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({message: errors.array()[0].msg});
        }

        const {email, password} = req.body;

        try {
            const user = await User.findOne({email, method: 'local'});

            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }

            const isMatch = await user.validPassword(password);

            if (!isMatch) {
                return res.status(401).json({message: 'Invalid password'});
            }

            const token = signToken(user);

            res.status(200).json({
                token: `Bearer ${token}`,
                user: {
                    userId: user.id,
                    username: user.username,
                    phone: user.phone,
                    email: user.email
                }
            });
        } catch (e) {
            errorHandler(res, e);
        }
    },

    google: (req, res) => {
        const token = signToken(req.user);

        res.status(200).json({token: `Bearer ${token}`, user: req.user});
    },

    facebook: (req, res) => {
        const token = signToken(req.user);

        res.status(200).json({token: `Bearer ${token}`, user: req.user});
    },

    me: (req, res) => {
        res.json({user: req.user});
    },

    logout: (req, res) => {
        req.logout();
        res.redirect('/');
    }
}
