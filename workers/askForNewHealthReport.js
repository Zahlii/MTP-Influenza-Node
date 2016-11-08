function scheduleEvery(seconds,fn) {
    fn();
    setInterval(fn,1000*seconds);
}

const monogooseInitiator = require('../model/index.js');
monogooseInitiator.initMongoose();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const HealthReport = mongoose.model('HealthReport');
const config  = require('config');
const log = require('../util/log.js');
const locales = require('../util/locales');

module.exports = function(input, done) {
    scheduleEvery(600,function() {
        console.log(new Date().toLocaleString() + "\tasking for new health reports...");

        const threshhold = new Date(Date.now()-config.calc.sendNotificationOnHealthReportAge*1000);

        User.getForAskNewHealthReportUser( threshhold, (err, result) => {
            if(err) {
                log.backgroundError("Failed getting users based on last healthstate", err);
            } else {
                console.log(new Date().toLocaleString() + "\tfound "+result.length+ " users to remind");
                for(var i=0;i<result.length;i++) {
                    var u = result[i];
                    console.log('Sending out healthstate reminder to '+u._id);
                    u.lastHealthstateReminder = new Date();
                    u.save();
                    locales.setLocale(u.settings.locale);
                    u.sendPushNotification({message:locales.__("PUSH_REMINDER_HEALTHSTATE")});
                }
            }
        });
    });
};
