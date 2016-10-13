"use strict";


const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config  = require('config');


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
    },
    _user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

schema.index({'healthScore':1});
schema.index({'timestamp':1});
schema.index({'geo': '2dsphere'});
schema.index({'_user':1});
schema.index({'_healthReport':1});

schema.statics.getLocationsByProximityAndDate = function (lat, lng, proximity, dateEnd, cb) {
    var ts = dateEnd.getTime(),
        ts = ts - 86400*1000,
        dateStart = new Date(ts);

    return this.model('Location').aggregate([{
            $match: {
                geo: {
                    $geoNear: {
                        $geometry: {
                            type: "Point",
                            coordinates: [lng,lat] // LNG, LAT
                        },
                        $minDistance: 0,
                        $maxDistance: proximity // PROX
                    }
                },
                healthScore: {
                    $gte: config.calc.infectionHealthScoreThreshold  // above threshold
                },
                timestamp: {
                    $gte: dateStart,
                    $lte: dateEnd
                }
            }
        }, {
            $sort: {
                timestamp: -1 // DESC
            }
        }, {
            $group: {
                _id: "$_user", // $_user nachher
                geo: {
                    $first: "$geo" // newest location
                },
                healthScore: {
                    $avg: "$healthScore" // average healthscore in the time
                }
            }
        }],
        cb
    );
};

module.exports.Schema = schema;
