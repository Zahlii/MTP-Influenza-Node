'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    mail: {
        type: String,
        required: true,
        validate: {
            validator: (mail) => {
                return /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(mail);
            }
        }
    },
    birthDate: {
        type: Date,
        required: true,
        max: Date.now,
        min: new Date('1896-06-30')
    },
    fbUserId: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['m', 'f']
    },
    deviceTokens: {
        type: [String],
        required: true,
        default: []
    },
    settings: {
        warnRadius: {
            type: Number,
            min: 5,
            required: true,
            default: 60
        },
        updateFrequency: {
            type: Number,
            min: 5,
            required: true,
            default: 60
        }
    }
});

schema.statics.getUserByFbId = function(fbId, cb) {
    return this.find({ fbUserId: fbId }, cb);
};

schema.methods.getLastHealthReport = function(cb) {
    return model('HealthReport')
        .find(
            {_user:this._id, validTo: null}
            ,cb
        );
};

module.exports.Schema = schema;
