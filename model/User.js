'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const pushAgent = require('./push');

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
        type: [String]
    },
    lastPushNotification: {
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

schema.methods.sendPushNotification = function(data,cb) {
    var completed = 0;
    var todo = this.deviceTokens.length;
    this.lastPushNotification = Date.now();
    this.save();
    if(todo==0) {
        cb(null);
    } else {
        for (var i = 0; i < todo; i++) {
            pushAgent.sendPushNotification(this.deviceTokens[i], data, (err) => {
                if (++completed >= todo) cb(err);
            })
        }
    }
};

module.exports.Schema = schema;
