/**
 * Created by sebas on 06.07.2016.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
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

schema.index({ location : '2dsphere' });

schema.statics.getLocationsByProximityAndDate = function(lat, lng, date, cb) {
    //TODO geosphere points in das document einbauen
    //see http://stackoverflow.com/questions/25734092/query-locations-within-a-radius
};

module.exports.Schema = schema;
