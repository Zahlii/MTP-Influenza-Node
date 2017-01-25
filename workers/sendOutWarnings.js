'use strict'

function scheduleEvery(seconds,fn) {
    fn();
    setInterval(fn,1000*seconds);
}

const monogooseInitiator = require('../model/index.js');
monogooseInitiator.initMongoose();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const HealthReport = mongoose.model('HealthReport');
const Location = mongoose.model('Location');
const config  = require('config');
const log = require('../util/log.js');

module.exports = function(input, done) {
    scheduleEvery(600,function() {
        const dt = new Date(Date.now()-config.calc.warningTimeInterval*1000);

        log.info("Warning users...");

        User.getWarningPushUser(dt)
            .then((result) => {
                log.info("Found "+result.length+ " users to check");
                for(var i=0; i<result.length; i++) {
                    let user = result[i];
                    user.sendPushWarning(done);
                }
        }).catch(err => {
            log.APIError('Failed to get users for warning',err,req);
        })
    });
};
