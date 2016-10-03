'use strict';
const mongoose = require('mongoose');
const HealthReport = mongoose.model('HealthReport');
const User = mongoose.model('User');
const Location = mongoose.model('Location');
const helpers = require('../util/helpers');
const config = require('config');
const log = require('../util/log.js');
const timing = require('../util/timing.js');

module.exports.createHealthReport = (req, res, next) => {
    timing.start(req);
    const bdy = req.body;

    if (bdy.issuedOn) {
        delete bdy.issuedOn;
    }
    if (bdy.validTo) {
        delete bdy.validTo;
    }


    const hr = new HealthReport(bdy);
    hr.issuedOn = new Date()

    hr.devalidatePrevious((err) => {if (err) log.APIError('Failed to devalidate previous healthreports', err)});

    User.prepareForNewHealthReport(hr._user, bdy.lat, bdy.lng, (err, user) => {
        if (err || !user){
            log.APIError('Failed to retrieve user', req,  err);
            res.send(500);
            return next();
        }
        hr.gender = user.gender
        hr.age = helpers.calculateAge(user.birthDate);
        hr.healthScore = helpers.calculateHealthScore(bdy);
        hr.isSick = (hr.healthScore >= config.calc.infectionHealthScoreThreshold)
        hr.isNewlyInfected = !((!hr.isSick) || user.isSick)
        if (hr.isSick != user.isSick) user.setSickFlag(hr.isSick, (err) => {if (err) log.APIError('Failed to set sick flag', err)});

        hr.save((err, _hr) => {
            if (err){
                log.APIError('Failed to save healthreport', req,  err);
                res.send(500);
                return next();
            }
            hr._id = _hr
            const location = new Location()
            location.geo = {
                type: 'Point',
                coordinates: [bdy.lng, bdy.lat]
            };
            location.saveHrAligned(hr, (err, _loc) =>{
                if (err){
                    log.APIError('Failed to save location', req,  err);
                    res.send(500);
                    return next();
                }
                res.send(201)
                return next()
            });
        })
    });
};
