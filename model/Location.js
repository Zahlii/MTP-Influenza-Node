/**
 * Created by sebas on 06.07.2016.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
    lat: {
        type: Number,
        min:-90,
        max:90,
        required: true
    },
    lng: {
        type: Number,
        required: true,
        min:-180,
        max:180
    },
    timestamp: {
        type: Date,
        default: Date.now,
        max: Date.now,
        required: true
    },
    isNewlyInfected: {
        type: Boolean,
        required: true
    },
    _healthReport: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'HealthReport'
    }
});

module.exports.Schema = schema
