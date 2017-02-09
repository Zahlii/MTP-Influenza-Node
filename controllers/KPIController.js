'use strict';
const mongoose = require('mongoose');
const HealthReport = mongoose.model('HealthReport');
const User = mongoose.model('User');
const Location = mongoose.model('Location');
const log = require('../util/log.js');
const time = require('../util/timing.js');
const config = require('config');

module.exports.getKPIInfo = (req,res,next) => {
    const bdy = req.body;

    var bbox = [parseFloat(bdy.lngSW), parseFloat(bdy.latSW), parseFloat(bdy.lngNE), parseFloat(bdy.latNE)];

    var s = [[[bbox[0],bbox[1]],[bbox[0],bbox[3]],[bbox[2],bbox[3]],[bbox[2],bbox[1]],[bbox[0],bbox[1]]]];

    var dateEnd = new Date(bdy.date);
    var ts = dateEnd.getTime(),
        ts = ts - 86400*1000,
        dateStart = new Date(ts);


    Location.aggregate([{
        $match: {
            geo: {
                $geoWithin: {
                    $geometry: {
                        type: "Polygon",
                        coordinates: s
                    }
                }
            },
            healthScore: {
                $gte: config.calc.infectionHealthScoreThreshold
            },
            timestamp: {
                $gte: dateStart,
                $lte: dateEnd
            }
        }
    }, {
        $project: {
            _id:1,
            _user:1,
            isNew: { $cond: ["$isNewlyInfected",1,0] }
        }
    }, {
        $group: {
            _id: "$_user",
            isNew: { $first : "$isNew" }
        }
    }, {
        $group: {
            _id: 1,
            countAll: {
                $sum: 1
            },
            countNew: {
                $sum: "$isNew"
            }
        }
    }]).exec().then(r => {
        res.send(201,r);
    }).catch(err => {
        log.APIError('Failed to retrieve KPI timeline data',err,req);
        res.send(500,err);
    }).finally(() => {
        return next();
    })
};

module.exports.getTimelineInfo = (req,res,next) => {
    // [ 8.4375, 49.15296965617039, 8.7890625, 49.38237278700955 ] sw, ne => bbox

    const bdy = req.body;

    var bbox = [parseFloat(bdy.lngSW), parseFloat(bdy.latSW), parseFloat(bdy.lngNE), parseFloat(bdy.latNE)];

    var s = [[[bbox[0],bbox[1]],[bbox[0],bbox[3]],[bbox[2],bbox[3]],[bbox[2],bbox[1]],[bbox[0],bbox[1]]]];

    Location.aggregate([{
        $match: {
            geo: {
                $geoWithin: {
                    $geometry: {
                        type: "Polygon",
                        coordinates: s
                    }
                }
            },
            healthScore: {
                $gte: config.calc.infectionHealthScoreThreshold
            }
        }
    }, {
        $project: {
            timestamp:1,
            _id:1,
            _user:1,
            isNew: { $cond: ["$isNewlyInfected",1,0] }
        }
    }, {
        $group: {
            _id: {
                dt: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$timestamp"
                    }
                },
                u: "$_user"
            },
            isNew: { $first : "$isNew" }
        }
    }, {
        $group: {
            _id: "$_id.dt",
            countAll: {
                $sum: 1
            },
            countNew: {
                $sum: "$isNew"
            }
        }
    }, {
        $sort: { _id: -1 }
    }]).exec().then(r => {
        res.send(201,r);
    }).catch(err => {
        log.APIError('Failed to retrieve KPI timeline data',err,req);
        res.send(500,err);
    }).finally(() => {
        return next();
    })
};
