'use strict';
const mongoose = require('mongoose');
const HealthReport = mongoose.model('HealthReport');
const User = mongoose.model('User');
const helpers = require('../model/helpers');
const config = require('config');
const log = require('../config/log.js');

module.exports.createHealthReport = (req, res, next) => {
    const bdy = req.body;

    if (bdy.issuedOn) {
        delete bdy.issuedOn;
    }
    if (bdy.validTo) {
        delete bdy.validTo;
    }


    const hr = new HealthReport(bdy);

    User.findById(bdy._user, (err, doc) => {
        if (err) {
            log.APIError('Error while searching user by ID',err,req);
            res.send(500, err);
            return next()
        } else if (doc === null) {
            log.APIError('Unknown user',null,req);
            res.send(500, new Error('Unknown user ' + bdy._user));
            return next()
        } else {
            var now = new Date();

            hr.issuedOn = now;
            hr.gender = doc.gender;
            hr.age = helpers.calculateAge(doc.birthDate);
            hr.healthScore = helpers.calculateHealthScore(bdy);

            doc.lastHealthReport = now;
            doc.save();

            hr.getPrevious((err, prev) => {
                var isSick = (hr.healthScore >= config.calc.infectionHealthScoreThreshold);

                if (err) {
                    log.APIError('Could not get previous health report',err,req);
                    res.send(500, err);
                    return next()
                }
                else if (prev == null || prev.length == 0) {
                    // no old health report, so this one is an infection only if it exceeds the threshold
                    hr.isNewlyInfected = isSick;
                    hr.save((err) => {
                        if (err) {
                            log.APIError('Could not save first health report',err,req);
                            res.send(500, err);
                            return next()
                        }
                        else {
                            require('./LocationController').reportLocation(req,res,next,true);
                        }
                    });
                    return next()
                } else {
                    prev = prev[0];
                    // old health report, only count new infection if last one wasn't already sick
                    hr.isNewlyInfected = !prev.isNewlyInfected && (prev.healthScore < config.calc.infectionHealthScoreThreshold) && isSick ;

                    prev.validTo = now;

                    prev.save((err)=> {
                        if (err) {
                            log.APIError('Could not devalidate previous health report',err,req);
                            res.send(500, err);
                            return next()
                        }
                        else {

                            hr.save((err) => {
                                if (err) {
                                    log.APIError('Could not save health report',err,req);
                                    res.send(500, err);
                                    return next()
                                }
                                else {
                                    require('./LocationController').reportLocation(req,res,next,true);
                                }
                            });
                        }
                    });
                }

            });
        }
    });


};
