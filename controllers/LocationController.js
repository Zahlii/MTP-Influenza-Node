/**
 * Created by sebas on 06.07.2016.
 */
'use strict';
const mongoose = require('mongoose');
const Location = mongoose.model('Location');
const HealthReport = mongoose.model('HealthReport');
const User = mongoose.model('User');


module.exports.reportLocation = (req, res, next, isNew) => {
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
        } else if (doc == null || doc.length == 0) {
            res.send(500, new Error('Unknown user ' + bdy._user+' or trying to send location without valid HealthState'));
            return next()
        } else {
            doc = doc[0];
            location._healthReport = doc._id;
            location.healthScore = doc.healthScore;
            location.isNewlyInfected = isNew;

            User.update({_id:bdy._user},{
                $set:{
                    lastLocation: bdy.geo
                }
            },(err) => {
                if (err) res.send(500, err);
                else {
                    location.save((err) => {
                        if (err) res.send(500, err);
                        else res.send(201, location);
                        return next()
                    })
                }
            });


        }
    });
};

module.exports.getLocationsByProximityAndDate = (req, res, next) => {
    const exclude = '-_id -_healthReport -__v -geo.type';
    const bdy = req.body;
    Location.getLocationsByProximityAndDate(bdy.lat, bdy.lng,
        bdy.proximity, new Date(bdy.date), exclude, (err, locations) => {
            if (err) res.send(500, err);
            else {
                // TODO klären ob hier Umformatierung des Geo-Attributes notwendig ist und ggfs vornehmen.
                res.send(200, locations)
            }
            return next();
        });
};

