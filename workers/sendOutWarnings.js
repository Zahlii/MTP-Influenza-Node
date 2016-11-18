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

        User.getWarningPushUser(dt).exec()
            .then((err, result) => {
            if(err) {
                log.backgroundError("Failed getting users based on last warning", err);
                log.err(err);
            } else {
                log.info("Found "+result.length+ " users to check");
                for(var i=0; i<result.length; i++) {
                    let user = result[i];
                    user.sendPushWarning(done);
                }
            }
        });
    });
};
