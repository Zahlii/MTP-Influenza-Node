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
    lastPushNotification: {
        type: Date,
        default: null,
        max: Date.now
    },
    lastWarningPushNotification: {
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
    },
    lastLocation: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: false
        }
    },
    isSick: {
            type: Boolean,
            required: false,
            default: false
    }
});

schema.index({'lastHealthReport':1});
schema.index({'lastPushNotification':1});
schema.index({'lastWarningPushNotification':1});
schema.index({'timestamp':1});
schema.index({'fbUserId':1});
schema.index({'mail':1});
schema.index({'lastLocation': '2dsphere'});

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
   // this.lastPushNotification = Date.now();
   // this.save();
    if(todo==0) {
        if(cb && typeof cb == 'function')
            cb(null, {"status":"ok","deviceTokens":0});
    } else {
        for (var i = 0; i < todo; i++) {
            pushAgent.sendPushNotification(this.deviceTokens[i], data, (err) => {
                if (++completed >= todo) {
                    if(cb && typeof cb == 'function')
                        cb(err, {"status":"ok","deviceTokens":todo});
                }
            })
        }
    }
};

schema.methods.setSickFlag = function(flag, cb) {
    this.model('User').update(
        {_id : this._id},
        {$set: {
            isSick : flag
        }},
        {multi: false},
        cb
    );
};

schema.statics.updateLocation = function(userId, lat, lng, cb) {
    const location = {
        type:'Point',
        coordinates: [lng, lat]
    };
    this.model('User').update(
        userId,
        {$set: {
            lastLocation : location
        }},
        {multi: false},
        cb
    );
};

schema.statics.prepareForNewHealthReport  = function(userId, lat, lng, cb) {
    const location = {
        type:'Point',
        coordinates: [lng, lat]
    };

    this.model('User').findByIdAndUpdate(
        userId,
        {$set: {
            lastHealthReport : new Date(),
            lastLocation : location
        }},
        {new: true},
        cb
    );
};



module.exports.Schema = schema;
