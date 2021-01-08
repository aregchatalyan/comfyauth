const {body} = require('express-validator');

module.exports.register = [
    body('username')
        .trim()
        .not().isEmpty().withMessage('Username is required')
        .isLength({min: 2}).withMessage('Username cannot be less than 2 characters'),

    body('phone')
        .trim()
        .not().isEmpty().withMessage('Phone number is required')
        .isMobilePhone('any', {strictMode: true}).withMessage('Incorrect phone number'),

    body('email')
        .trim()
        .not().isEmpty().withMessage('E-mail is required')
        .isEmail().withMessage('Please provide a valid email address'),

    body('password')
        .trim()
        .isLength({min: 6}).withMessage('Password cannot be less than 6 characters'),

    body('confirm_password')
        .trim()
        .isLength({min: 6}).withMessage('Password mismatch')
        .custom((value, {req}) => (value === req.body.password)).withMessage('Password mismatch')
];

module.exports.newPassword = [
    body('password')
        .trim()
        .isLength({min: 8}).withMessage('Cannot be less than 8 characters'),

    body('confirm_password')
        .trim()
        .isLength({min: 8}).withMessage('Password mismatch')
        .custom((value, {req}) => (value === req.body.password)).withMessage('Password mismatch')
];

module.exports.support = [
    body('name')
        .trim()
        .not().isEmpty().withMessage('Name is required')
        .isLength({min: 2}).withMessage('Cannot be less than 2 characters'),

    body('email')
        .trim()
        .not().isEmpty().withMessage('E-mail is required')
        .isEmail().withMessage('Please provide a valid email address'),

    body('text')
        .trim()
        .isLength({min: 2}).withMessage('The text is too short')
        .isLength({max: 1020}).withMessage('The text is too long')
];

module.exports.editUser = [
    body('username')
        .trim()
        .not().isEmpty().withMessage('Name is required')
        .isLength({min: 2}).withMessage('Cannot be less than 2 characters'),

    body('phone')
        .trim()
        .not().isEmpty().withMessage('Phone number is required')
        .isMobilePhone('any', {strictMode: true}).withMessage('Incorrect phone number'),

    body('email')
        .trim()
        .not().isEmpty().withMessage('E-mail is required')
        .isEmail().withMessage('Please provide a valid email address')
];

module.exports.changePassword = [
    body('old_password')
        .trim()
        .isLength({min: 8}).withMessage('Incorrect password'),

    body('new_password')
        .trim()
        .isLength({min: 8}).withMessage('Cannot be less than 8 characters'),

    body('confirm_password')
        .trim()
        .isLength({min: 8}).withMessage('Password mismatch')
        .custom((value, {req}) => (value === req.body.new_password)).withMessage('Password mismatch')
];

module.exports.addContact = [
    body('username')
        .trim()
        .optional()
        .isLength({min: 2}).withMessage('Cannot be less than 2 characters'),

    body('first_name')
        .trim()
        .optional()
        .isLength({min: 2}).withMessage('Cannot be less than 2 characters'),

    body('last_name')
        .trim()
        .optional()
        .isLength({min: 2}).withMessage('Cannot be less than 2 characters'),

    body('phone')
        .trim()
        .optional()
        .isMobilePhone('any', {strictMode: true}).withMessage('Incorrect phone number'),

    body('email')
        .trim()
        .optional()
        .isEmail().withMessage('Please provide a valid email address')
];

module.exports.scheduleMeet = [
    body('date')
        .trim()
        .not().isEmpty().withMessage('Date is required')
        .isLength({min: 2}).withMessage('Cannot be less than 2 characters'),

    body('name')
        .trim()
        .not().isEmpty().withMessage('Name is required')
        .isLength({min: 2}).withMessage('Cannot be less than 2 characters'),

    body('meeting_id')
        .trim()
        .not().isEmpty().withMessage('Id is required')
        .isLength({min: 2}).withMessage('Cannot be less than 2 characters'),
];