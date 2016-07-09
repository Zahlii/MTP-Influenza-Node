/**
 * Created by sebas on 06.07.2016.
 */
'use strict';
const mongoose = require('mongoose');
const Location = mongoose.model('Location');


module.exports.reportLocation = (req, res, next) => {
    const bdy = req.body
    if (bdy.timestamp) { delete bdy.timestamp}
    bdy.location = {
        coordinates : [bdy.lng, bdy.lat]
    };
    delete bdy.lng, bdy.lat
    const location = new Location(bdy);
    location.save((err) => {
        if (err) res.send(500, err)
         else res.send(201);
        return next()
    })
};

//todo get Locations around somewhere (timeframe)
//todo HealthReport around somewhere (timeframe)
