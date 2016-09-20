'use strict';
const mongoose = require('mongoose');
const HealthReport = mongoose.model('HealthReport');
const User = mongoose.model('User');
const Location = mongoose.model('Location');
const log = require('../util/log.js');
const time = require('../util/timing.js');

module.exports.getNewInfectionsAroundUserAtDate = (req, res, next) => {
    const bdy = req.body;
    var dateEnd = new Date(bdy.date);
    var ts = dateEnd.getTime(),
        ts = ts - 86400*1000,
        dateStart = new Date(ts);


    User.findById(bdy._user, (err, u) => {
        if (err) {
            log.APIError('Error while searching user by ID', err, req);
            res.send(500, err);
            return next()
        } else if (u === null) {
            log.APIError('Unknown user', null, req);
            res.send(500, new Error('Unknown user ' + bdy._user));
            return next()
        } else {
            if (!u.lastLocation || u.lastLocation.coordinates.length < 2) {
                log.APIError('No location fixed for user while querying KPIs', null, req);
                res.send(500, new Error('No location fixed for user while querying KPIs : ' + bdy._user));
                return next();
            }

            var c = u.lastLocation.coordinates;


            Location.aggregate(
                [
                    {
                        $geoNear: {
                            near: {
                                type: "Point",
                                coordinates: c
                            },
                            limit:10000000,
                            query:{
                                isNewlyInfected:true,
                                timestamp: {
                                    $gte: dateStart,
                                    $lte: dateEnd
                                }
                            },
                            distanceField: "dist",
                            maxDistance: 800000,
                            spherical: true
                        }
                    },
                    {
                        $group: {
                            _id: "$_healthReport"
                        }
                    },
                    {
                        $group: { _id: 1, count: { $sum: 1 } }
                    }
                ],(err,doc) => {
                    if(err) {
                        log.APIError('Couldn\'t aggregate locations for KPIs', err, req);
                        res.send(500, err);
                        return next();
                    } else {
                        res.send(201,doc);
                    }
                }
            )
        }
    });

};