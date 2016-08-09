function scheduleEvery(seconds,fn) {
    fn();
    setInterval(fn,1000*seconds);
}


const mongoose = require('mongoose');
const monogooseInitiator = require('../model/index.js');
monogooseInitiator.initMongoose();
const User = mongoose.model('User');
const HealthReport = mongoose.model('HealthReport');
const config  = require('config');

module.exports = function(input, done) {
    scheduleEvery(5,function() {
        const dt = new Date(Date.now()-config.calc.sendNotificationOnHealthReportAge*1000);

        User.find({
            $or: [
                {
                    lastHealthReport: {
                        $lt: dt
                    }
                },
                {
                    lastHealthReport: null
                }
            ],
            $or: [
                {
                    lastPushNotification: {
                        $lt: dt
                    }
                },
                {
                    lastPushNotification: null
                }
            ]
        },(err,result) => {
            console.log(result);
        });
    });
};
