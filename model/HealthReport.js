/**
 * Created by sebas on 06.07.2016.
 */
'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config  = require('config');

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
	smileyRating: {
        type: Number,
        min: 1,
        max: 5,
        required:true
    },
    isNewlyInfected: {
        type: Boolean,
        required: true
    },
    issuedOn: {
        type: Date,
        default: Date.now,
        required: true,
        max: Date.now
    },
    validTo: {
        type: Date,
        default:  function(){return +new Date() + config.calc.defaultValidityDays*24*60*60*1000},
        required: true,
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


schema.index({'validTo':1});
schema.index({'issuedOn':1});
schema.index({'healthScore':1});
schema.index({'_user':1});
schema.index({'isNewlyInfected':1});


module.exports.Schema = schema;
