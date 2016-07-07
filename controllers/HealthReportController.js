'use strict';
const mongoose = require('mongoose');
const HealthReport = mongoose.model('HealthReport');


module.exports.createHealthReport = (req, res, next) => {
    const bdy = req.body;
    if (bdy.issuedOn) { delete bdy.issuedOn}
    if (bdy.validTo) { delete bdy.validTo}
    const hr = new HealthReport(bdy);
    hr.devalidatePrevious((err) => {
        if (err) res.send(500, err);
        else {
            hr.save( (err) => {
               if (err) res.send(500);
                else res.send(201);
            })
        }
        return next()
    });
};
