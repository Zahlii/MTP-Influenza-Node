'use strict';
const mongoose = require('mongoose');
const HealthReport = mongoose.model('HealthReport');
const User = mongoose.model('User');
const Location = mongoose.model('Location');
const log = require('../util/log.js');
const time = require('../util/timing.js');
const config = require('config');


function getGroupedData(bdy,onlyNew) {
    var dateEnd = new Date(bdy.date);
    var ts = dateEnd.getTime(),
        ts = ts - 86400*1000,
        dateStart = new Date(ts);

    var m = {
        geo: {
            $geoNear: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(bdy.lng),parseFloat(bdy.lat)] // LNG, LAT
                },
                $minDistance: 0,
                $maxDistance: parseFloat(bdy.proximity) // PROX
            }
        },
        healthScore: {
            $gte: config.calc.infectionHealthScoreThreshold // above threshold
        },
        isNewlyInfected: true,
        timestamp: {
            $gte: dateStart,
            $lte: dateEnd
        }
    };

    if(!onlyNew)
        delete m.isNewlyInfected;

    return Location.aggregate([{
        $match: m
    }, {
        $group: {
            _id: "$_user"
        }
    }, {
        $group: {
            _id: 1,
            count : { $sum: 1 }
        }
    }]).exec();

}
module.exports.getNewInfectionsAroundPositionAtDate = (req, res, next) => {
    getGroupedData(req.body,true).then(r => {
        res.send(201,r);
    }).catch(err => {
        log.APIError('Failed to retrieve KPI data',err,req);
        res.send(500,err);
    }).finally(() => {
        return next();
    })
};

module.exports.getTotalInfectionsAroundPositionAtDate = (req, res, next) => {
    getGroupedData(req.body,false).then(r => {
        res.send(201,r);
    }).catch(err => {
        log.APIError('Failed to retrieve KPI data',err,req);
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
