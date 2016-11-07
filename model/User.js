'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const pushAgent = require('./../util/push');
const log = require('../util/log.js');
const locales = require('../util/locales');


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

schema.statics.getWarningPushUser = function (lastWarningThreshold, cb) {
    return this.find(
        {
            $or: [
                {lastWarningMessage: {$lt: lastWarningThreshold}},
                {lastWarningMessage: null}
            ],
            $and : [
                {deviceTokens : {$exists:true}},
                {$where : 'this.deviceTokens.length > 0'},
                {lastLocation : {$exists:true}},
                {$where : 'this.lastLocation.coordinates.length = 2'}
            ]
        }, cb)
}

schema.methods.sendPushNotification = function (data, cb) {
    var completed = 0;
    var deviceTokens_length = this.deviceTokens.length;
    const push_errors = [];

    for (var i = 0; i < deviceTokens_length; i++) {
        let currentToken = this.deviceTokens[i];
        pushAgent.sendPushNotification(currentToken, data, (err) => {
            push_errors.push(err);
            if (++completed >= deviceTokens_length) {
                if (cb)
                    cb(push_errors, {"status": "ok", "deviceTokens": deviceTokens_length});
            }
        })
    }
};

schema.methods.sendPushWarning = function (cb) {
    let user_location = this.lastLocation.coordinates;
    this.model('Location').getLocationsByProximityAndDate(user_location[1], user_location[0], this.settings.warnRadius*1000, now, (err,locations) => {
        if(err) {
            log.backgroundError("Failed getting locations around user", err);
        } else {
            var location_length = locations.length;
            console.log('Got ' + location_length +' flu cases around '+ user._id);
            if(location_length >= config.calc.minNewInfectionsForWarning) {
                this.lastWarningMessage = new Date();
                this.save();
                locales.setLocale(this.settings.locale);
                this.sendPushNotification({message:locales.__("PUSH_ALERT_FLU",location_length)}, cb);
            }
        }
    });
};

module.exports.Schema = schema;
