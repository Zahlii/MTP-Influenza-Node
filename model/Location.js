/**
 * Created by sebas on 06.07.2016.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
    geo: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
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
    healthScore: {
        type: Number,
        min: 0,
        max: 100,
        required:true
    },
    _healthReport: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'HealthReport'
    }
});

schema.index({'geo': '2dsphere'})

schema.statics.getLocationsByProximityAndDate = function (lat, lng, proximity, date, params, cb) {
    var ts = date.getTime(),
        ts = ts - ts % 86400 * 1000,
        dateStart = new Date(ts),
        dateEnd = new Date(ts + 86400 * 1000);


    return this.model('Location').find(
        {
            'geo': {
                $nearSphere: [lng, lat],
                $maxDistance: proximity
            },
            'timestamp': {
                $gte: dateStart,
                $lte: dateEnd
            }
        },
        params,
        cb
    );
};


module.exports.Schema = schema;
