const {Schema, model} = require('mongoose');

const supportSchema = new Schema({
    name: String,
    email: {type: String, lowercase: true},
    text: String
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = model('Support', supportSchema);
