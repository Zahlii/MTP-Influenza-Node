'use strict';
const mongoose = require('mongoose');
const HealthReport = mongoose.model('HealthReport');
const User = mongoose.model('User');
const Location = mongoose.model('Location');
const helpers = require('../util/helpers');
const config = require('config');
const log = require('../util/log.js');
const timing = require('../util/timing.js');

function UpdateUserLastHealthReport(bdy,now) {
    return User.findByIdAndUpdate(bdy._user, {
        $set: {
            'lastHealthReport': now,
            'lastLocation': {
                type: 'Point',
                coordinates: [parseFloat(bdy.lng), parseFloat(bdy.lat)]
            },
        }
    }, {new: true}).exec();
}

function GetAndInvalidateOldHealthReport(user, now) {
    return HealthReport.findOneAndUpdate(
        {
            _user:user._id,
            validTo: {
                $gt: now
            }
        },
        {
            $set: {
                validTo: now
            }
        }, {new: true}).exec();
}

function InsertNewHealthReport(bdy, currentUser,oldHR,now) {


    bdy.issuedOn = now;
    bdy.validTo = new Date(+now + config.calc.defaultValidityDays*24*60*60*1000);
    bdy.gender = currentUser.gender;
    bdy.age = helpers.calculateAge(currentUser.birthDate);
    bdy.healthScore = helpers.calculateHealthScore(bdy);



    var t = config.calc.infectionHealthScoreThreshold;
    var isSickScore = bdy.healthScore >= t;

    if(oldHR != null) {
        // we have a relatively new HR, so it's only a new infection if the user wasn't sick then but is now
        bdy.isNewlyInfected = isSickScore && !oldHR.healthScore >= t;
    } else {
        bdy.isNewlyInfected = isSickScore;
    }

    var newHR = new HealthReport(bdy);

    return newHR.save();
}

function InsertLocationUpdate(bdy,currentUser,newHR,now) {
    var d = {
        timestamp: now,
        geo: {
            type: 'Point',
            coordinates: [bdy.lng, bdy.lat]
        },
        isNewlyInfected: newHR.isNewlyInfected,
        healthScore: newHR.healthScore,
        _healthReport: newHR._id,
        _user: currentUser._id
    };

    return new Location(d).save();
}

module.exports.createHealthReport = (req, res, next) => {
    timing.start(req);
    const bdy = req.body;

    var n = new Date();


    var currentUser;
    var oldHR;
    var newHR;

    UpdateUserLastHealthReport(bdy,n).then(newUser => {
        timing.elapsed('Updated lastHealthReport of user');

        if(!newUser)
            throw new Error('Unknown user');
        currentUser = newUser;

        return GetAndInvalidateOldHealthReport(newUser, n);
    }).
    then(hr => {
        timing.elapsed('Invalidated and fetched old HR');
        oldHR = hr;
        return InsertNewHealthReport(bdy,currentUser,oldHR,n);
    }).
    then(hr => {
        timing.elapsed('Saved new HR');
        newHR = hr;
        return InsertLocationUpdate(bdy,currentUser,newHR,n);
    }).
    then(loc => {
        timing.elapsed('Inserted new location');
        res.send(201,newHR);
    }).
    catch(err => {
        // Something went wrong during update
        log.APIError('Couldn\'t save healthstate',err,req);
        res.send(500,err);
    }).finally(() => {
        return next();
    })



};
