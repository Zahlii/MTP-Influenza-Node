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


    return Location.aggregate([{
        $match: {
            geo: {
                $geoNear: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(bdy.lng),parseFloat(bdy.lat)] // LNG, LAT
                    },
                    $minDistance: 0,
                    $maxDistance: 60000 // PROX
                }
            },
            healthScore: {
                $gte: config.calc.infectionHealthScoreThreshold // above threshold
            },
            isNewlyInfected: onlyNew,
            timestamp: {
                $gte: dateStart,
                $lte: dateEnd
            }
        }
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