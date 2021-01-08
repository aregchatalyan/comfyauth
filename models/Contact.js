const {Schema, model, Types} = require('mongoose');

const contactSchema = new Schema({
    user: {
        ref: 'users',
        type: Types.ObjectId
    },

    contact: [
        {
            username: String,
            by: {type: String, lowercase: true},
            method: String,
            accept_code: String,
        }
    ],
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = model('Contact', contactSchema);
