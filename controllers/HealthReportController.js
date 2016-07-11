'use strict';
const mongoose = require('mongoose');
const HealthReport = mongoose.model('HealthReport');
const User = mongoose.model('User');
const helpers = require('./helpers');
const config = require('config');

module.exports.createHealthReport = (req, res, next) => {
    const bdy = req.body;
    if (bdy.issuedOn) {
        delete bdy.issuedOn
    }
    if (bdy.validTo) {
        delete bdy.validTo
    }

    const hr = new HealthReport(bdy);

    User.findById(bdy._user, (err, doc) => {
        if (err) {
            res.send(500, err);
        } else if (doc === null) {
            res.send(500, new Error('Unknown user ' + bdy._user));
        } else {
            var now = new Date();

            hr.issuedOn = now;
            hr.gender = doc.gender;
            hr.age = helpers.calculateAge(doc.birthDate);
            hr.healthScore = helpers.calculateHealthScore(bdy);

            hr.getPrevious((err, prev) => {
                var isSick = (hr.healthScore >= config.calc.infectionHealthScoreThreshold);

                if (err) res.send(500, err);
                else if (prev === null) {
                    // no old health report, so this one is an infection only if it exceeds the threshold
                    hr.isNewlyInfected = isSick;
                } else {
                    // old health report, only count new infection if last one wasn't already sick
                    hr.isNewlyInfected = !prev.isNewlyInfected && (prev.healthScore < config.calc.infectionHealthScoreThreshold) && isSick ;

                    prev.validTo = now;

                    prev.save((err)=> {
                        if (err) res.send(500, err);
                        else {
                            hr.save((err) => {
                                if (err) res.send(500, err);
                                else res.send(201);
                            });
                        }
                    });
                }
                return next()
            });

        }
    });
};
