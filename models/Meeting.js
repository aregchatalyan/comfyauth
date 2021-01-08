const {Schema, model, Types} = require('mongoose');

const meetingSchema = new Schema({
    user: {
        ref: 'users',
        type: Types.ObjectId
    },
    date: {
        startTime: String,
        endTime: String,
        timezone: String
    },
    name: String,
    meeting_id: String,
    event_id: String,
    waiting_room: Boolean,
    require_password: Boolean,
    password: String,
    sync_with: String,
    contact: [
        {
            username: String,
            by: {type: String, lowercase: true},
            method: String,
        }
    ]
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = model('Meeting', meetingSchema);
