const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const {google, facebook, jwtSecret} = require('../config/keys');
const User = require('../models/User');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            return done(null, user)
        } catch (err) {
            return done(err, null)
        }
    });

    passport.use(new GoogleStrategy({
            clientID: google.clientID,
            clientSecret: google.clientSecret,
            callbackURL: google.callbackURL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await User.findOne({googleId: profile.id});

                if (existingUser) {
                    return done(null, existingUser);
                }

                const newUser = new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    thumbnail: profile.photos[0].value,
                    method: 'google'
                });

                await newUser.save();

                return done(null, newUser);
            } catch (e) {
                return done(e, false);
            }
        })
    );

    passport.use(new FacebookStrategy({
            clientID: facebook.clientID,
            clientSecret: facebook.clientSecret,
            callbackURL: facebook.callbackURL,
            profileFields: ['id', 'displayName', 'emails', 'photos']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await User.findOne({facebookId: profile.id});

                if (existingUser) {
                    return done(null, existingUser);
                }

                const newUser = new User({
                    facebookId: profile.id,
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    thumbnail: profile.photos[0].value,
                    method: 'facebook'
                });

                await newUser.save();

                return done(null, newUser);
            } catch (e) {
                return done(e, false);
            }
        })
    );

    passport.use(new JwtStrategy({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret
        }, async (payload, done) => {
            try {
                const user = await User.findById(payload.sub, {password: 0});

                if (user) {
                    return done(null, user);
                } else {
                    done(null, false);
                }
            } catch (err) {
                done(err, false);
            }
        })
    );
}
