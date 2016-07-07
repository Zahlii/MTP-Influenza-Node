/**
 * Created by sebas on 06.07.2016.
 */
'use strict';
const mongoose = require('mongoose');
const Location = mongoose.model('Locaation');


module.exports.reportLocation = (req, res, next) => {
    const bdy = req.body
    if (bdy.timestamp) { delete bdy.timestamp}
    const location = new Location(body);
    Location.save((err) => {
        if (err) {res.send(500, err)}
        else {
            res.send(201);
        }
        return next()
    })
}
