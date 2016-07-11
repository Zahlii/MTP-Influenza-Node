/**
 * Created by sebas on 06.07.2016.
 */
'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    _user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    isSick: {
        type: Boolean,
        required: true
    },
    healthScore: {
        type: Number,
        min: 0,
        max: 100,
        required:true
    },
    issuedOn: {
        type: Date,
        default: Date.now,
        required: true,
        max: Date.now
    },
    validTo: {
        type: Date,
        default: null,
        max: Date.now
    },
    hasHeadache: {
        type: Boolean,
        required: true
    },
    hasRunningNose: {
        type: Boolean,
        required: true
    },
    hasSoreThroat: {
        type: Boolean,
        required: true
    },
    hasLimbPain: {
        type: Boolean,
        required: true
    },
    hasFever: {
        type: Boolean,
        required: true
    },
    hasCoughing: {
        type: Boolean,
        required: true
    },
    age: {
        type: Number,
        min: 0,
        max: 120,
        required: true
    },
    gender: {
        type: String,
        enum: ['m', 'f'],
        required: true
    }
});

schema.methods.getPrevious = function(cb) {
    return this.model('HealthReport').getLastFromUser(this._user,cb);
};

schema.methods.devalidatePrevious = function(cb) {
    this.model('HealthReport').update(
        {_user : this._user, validTo : null},
        { $set: { validTo: new Date()}},
        {multi: true},
        cb
    );
};

schema.statics.getLastFromUser = function(_user,cb) {
    return this.model('HealthReport').find({_user : _user, validTo : null},cb);
};



module.exports.Schema = schema;
