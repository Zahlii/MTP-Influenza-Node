function scheduleEvery(seconds,fn) {
    fn();
    setInterval(fn,1000*seconds);
}


const mongoose = require('mongoose');
const monogooseInitiator = require('../model/index.js');
monogooseInitiator.initMongoose();
const User = mongoose.model('User');
const HealthReport = mongoose.model('HealthReport');
const Location = mongoose.model('Location');
const config  = require('config');

module.exports = function(input, done) {
    scheduleEvery(600,function() {
        const dt = new Date(Date.now()-config.calc.warningTimeInterval*1000);

        Location.find({

        },(err,result) => {
            if(err) {

            } else {
                for(var i=0;i<result.length;i++) {
                    var u = result[i];
                    //u.sendPushNotification({message:"Your last health report was quite some time ago. Please consider sending a new one."});
                }
            }
        });
    });
};
