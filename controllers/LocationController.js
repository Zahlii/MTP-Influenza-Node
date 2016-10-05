/**
 * Created by sebas on 06.07.2016.
 */
'use strict';
const mongoose = require('mongoose');
const Location = mongoose.model('Location');
const HealthReport = mongoose.model('HealthReport');
const User = mongoose.model('User');
const log = require('../util/log.js');
const timing = require('../util/timing.js');

function GetLastHealthReport(user, now) {
    return HealthReport.findOne(
        {
            _user:user,
            validTo: {
                $gt: now
            }
        }).exec();
}

module.exports.getLocationsByProximityAndDate = (req, res, next) => {
    const bdy = req.body;
	timing.start(req);
    Location.getLocationsByProximityAndDate(parseFloat(bdy.lat), parseFloat(bdy.lng),
        parseFloat(bdy.proximity), new Date(bdy.date), (err, locations) => {
			timing.elapsed('Got location response from DB');
            if (err) {
                log.APIError('Error while querying location data',err,req);
                res.send(500, err);
            }
            else {
                res.send(200, locations);
				timing.elapsed('Finished sending location response');
            }
            //global.gc();
            //timing.elapsed('Ran GC');
            return next();
        });
};

module.exports.reportLocation = (req,res,next) => {
    timing.start(req);

    const bdy = req.body;
    var n = new Date();

    bdy.timestamp = n;
    bdy.geo = {
        type:'Point',
        coordinates: [bdy.lng, bdy.lat]
    };
    delete bdy.lng;
    delete bdy.lat;

    GetLastHealthReport(bdy._user,n).then(hr => {
        if(!hr)
            throw new Error('Couldn\'t find user or no valid health report');

        bdy._healthReport = hr._id;
        bdy.isNewlyInfected = hr.isNewlyInfected;
        bdy.healthScore = hr.healthScore;
        var l = new Location(bdy);
        return l.save();
    }).
    then(loc => {
        res.send(201,loc);
        return next();
    }).
    catch(err => {
        // Something went wrong during update
        log.APIError('Couldn\'t update location',err,req);
        res.send(500,err);
        return next();
    });

};

