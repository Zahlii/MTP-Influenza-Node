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

}

module.exports.getTimelineInfo = (req,res,next) => {
    /*db.getCollection('locations').aggregate([{
        $match: {
            geo: {
                $geoNear: {
                    $geometry: {
                        type: "Point",
                        coordinates: [8.5,49.5] // LNG, LAT
                    },
                    $minDistance: 0,
                    $maxDistance: 500000 // PROX
                }
            },
            healthScore: {
                $gte: 40 // above threshold
            },
            isNewlyInfected: true
        }
    }, {
        $group: {
            _id: { $dateToString: {format:"%Y-%m-%d", date: "$timestamp" }},
            count: { $sum: 1 }
        }
    }]);*/


    /*db.getCollection('locations').aggregate([{
     $match: {
     healthScore: {
     $gte: 40 // above threshold
     },
     isNewlyInfected: true
     }
     }, {
     $group: {
     _id : { dt : { $dateToString: {format:"%Y-%m-%d", date: "$timestamp" }}, u: "$_user" },
     }
     }, {
     $group: {
     _id : "$_id.dt",
     count: { $sum: 1 }
     }
     }]);*/
}