/**
 * Created by sebas on 06.07.2016.
 */
'use strict';
const mongoose = require('mongoose');
const Location = mongoose.model('Location');
const HealthReport = mongoose.model('HealthReport');


module.exports.reportLocation = (req, res, next) => {
    const bdy = req.body;
    if (bdy.timestamp) {
        delete bdy.timestamp
    }
    bdy.geo = {
        coordinates: [bdy.lng, bdy.lat]
    };
    delete bdy.lng;
    delete bdy.lat;
    const location = new Location(bdy);

    HealthReport.getLastFromUser(bdy._user, (err, doc) => {
        if (err) {
            res.send(500, err);
            return next()
        } else if (doc === null) {
            res.send(500, new Error('Unknown user ' + bdy._user+' or trying to send location without valid HealthState'));
            return next()
        } else {
            location._healthReport = doc._id;
            location.healthScore = doc.healthScore;
            location.save((err) => {
                if (err) res.send(500, err);
                else res.send(201);
                return next()
            })
        }
    });
};

module.exports.getLocationsByProximityAndDate = (req, res, next) => {
    const exclude = '-_id -_healthReport -__v -geo.type';
    Location.getLocationsByProximityAndDate(req.params.lat, req.params.lng,
        req.params.proximity, new Date(req.params.date), exclude, (err, locations) => {
            if (err) res.send(500, err);
            else {
                // TODO klären ob hier Umformatierung des Geo-Attributes notwendig ist und ggfs vornehmen.
                res.send(200, locations)
            }
            return next();
        });
};

