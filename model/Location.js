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

schema.index({'healthScore':1});
schema.index({'timestamp':1});
schema.index({'geo': '2dsphere'});

schema.statics.getLocationsByProximityAndDate = function (lat, lng, proximity, dateEnd, cb, par) {
    var ts = dateEnd.getTime(),
        ts = ts - 86400*1000,
        dateStart = new Date(ts);

    const params = par || '-_id -_healthReport -__v -geo.type';

    
    return this.model('Location').find(
        {
            geo: {
                $nearSphere : {
                    $geometry: { type: "Point",  coordinates: [lng,lat] },
                    $minDistance: 0,
                    $maxDistance: proximity
                }
            },
            timestamp: {
                $gte: dateStart,
                $lte: dateEnd
            }
        },
        params,
        cb
    );
};


module.exports.Schema = schema;
