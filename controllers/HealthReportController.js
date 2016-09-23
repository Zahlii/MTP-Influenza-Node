'use strict';
const mongoose = require('mongoose');
const HealthReport = mongoose.model('HealthReport');
const User = mongoose.model('User');
const helpers = require('../util/helpers');
const config = require('config');
const log = require('../util/log.js');
const time = require('../util/timing.js');

module.exports.createHealthReport = (req, res, next) => {
    time.start(req);
    const bdy = req.body;

    if (bdy.issuedOn) {
        delete bdy.issuedOn;
    }
    if (bdy.validTo) {
        delete bdy.validTo;
    }


    const hr = new HealthReport(bdy);
    time.elapsed('HR created');
    User.findById(bdy._user, (err, doc) => {
        time.elapsed('User for HR found');
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
                time.elapsed('Previous HR found');
                if (err) {
                    log.APIError('Could not get previous health report',err,req);
                    res.send(500, err);
                    return next()
                }
                else if (prev == null || prev.length == 0) {
                    // no old health report, so this one is an infection only if it exceeds the threshold
                    hr.isNewlyInfected = isSick;
                    hr.save((err,newHR) => {
                        time.elapsed('Saved first HR');
                        if (err) {
                            log.APIError('Could not save first health report',err,req);
                            res.send(500, err);
                            return next()
                        }
                        else {
                            require('./LocationController').reportLocation(req,res,next,newHR);
                        }
                    });
                    return next()
                } else {
                    prev = prev[0];
                    // old health report, only count new infection if last one wasn't already sick
                    hr.isNewlyInfected = !prev.isNewlyInfected && (prev.healthScore < config.calc.infectionHealthScoreThreshold) && isSick ;

                    prev.validTo = now;

                    prev.save((err)=> {
                        time.elapsed('Invalidated old HR');
                        if (err) {
                            log.APIError('Could not devalidate previous health report',err,req);
                            res.send(500, err);
                            return next()
                        }
                        else {

                            hr.save((err,newHR) => {
                                time.elapsed('Saved HR');
                                if (err) {
                                    log.APIError('Could not save health report',err,req);
                                    res.send(500, err);
                                    return next()
                                }
                                else {
                                    require('./LocationController').reportLocation(req,res,next,true,newHR);
                                }
                            });
                        }
                    });
                }

            });
        }
    });


};
