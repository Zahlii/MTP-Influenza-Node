'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const pushAgent = require('./../util/push');

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
    registeredOn: {
        type: Date,
        required: true,
        default: Date.now,
        max: Date.now
    },
    passwordHash: {
        type: String
    },
    fbUserId: {
        type: String
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
        type: [String]
    },
    lastHealthstateReminder: {
        type: Date,
        default: null,
        max: Date.now
    },
    lastWarningMessage: {
        type: Date,
        default: null,
        max: Date.now
    },
    lastHealthReport: {
        type: Date,
        default: null,
        max: Date.now
    },
    settings: {
        warnRadius: {
            type: Number,
            min: 5,
            default: 60
        },
        updateFrequency: {
            type: Number,
            min: 5,
            default: 60
        },
        locale: {
            type: String,
            required: true,
            default: "en"
        }
    },
    lastLocation: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
});

schema.index({'lastHealthReport':1});
schema.index({'lastHealthstateReminder':1});
schema.index({'lastWarningMessage':1});
schema.index({'fbUserId':1});
schema.index({'mail':1});
schema.index({'lastLocation': '2dsphere'});

schema.statics.getUserByFbId = function(fbId, cb) {
    return this.find({ fbUserId: fbId }, cb);
};

schema.methods.sendPushNotification = function(data,cb) {
    var completed = 0;
    var todo = this.deviceTokens.length;

    if(todo==0) {
        cb(null, {"status":"ok","deviceTokens":0});
    } else {
        for (var i = 0; i < todo; i++) {
            pushAgent.sendPushNotification(this.deviceTokens[i], data, (err) => {
                if (++completed >= todo) {
                    if(cb)
                        cb(err, {"status":"ok","deviceTokens":todo});
                }
            })
        }
    }
};

module.exports.Schema = schema;
