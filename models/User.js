const {Schema, model} = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    googleId: String,
    facebookId: String,

    username: String,
    phone: String,
    email: {type: String, lowercase: true},
    thumbnail: String,
    password: String,

    method: String,
    accept_code: String,
    resetToken: String,
    resetTokenExp: Date,
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {
            next();
        }

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (e) {
        next(e);
    }
});

userSchema.pre('updateOne', async function (next) {
    try {
        if (!this._update.password) {
            next()
        }

        const salt = await bcrypt.genSalt(10);
        this._update.password = await bcrypt.hash(this._update.password, salt);
        next();
    } catch (e) {
        next(e)
    }
});

userSchema.methods.validPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = model('User', userSchema);
