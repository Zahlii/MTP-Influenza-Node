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
const log = require('../util/log.js');
const locales = require('../util/locales');

module.exports = function(input, done) {
    scheduleEvery(600,function() {
        const dt = new Date(Date.now()-config.calc.warningTimeInterval*1000);
        const now = new Date();

        console.log(new Date().toLocaleString() + "\twarning users...");

        User.find({
            $or: [
                {
                    lastWarningMessage: {
                        $lt: dt
                    }
                },
                {
                    lastWarningMessage: null
                }
            ]
        },(err,result) => {
            if(err) {
                log.backgroundError("Failed getting users based on last warning", err);
            } else {
                console.log(new Date().toLocaleString() + "\tfound "+result.length+ " users to check");
                for(var i=0;i<result.length;i++) {
                    var u = result[i];
                    if(!u.lastLocation || u.lastLocation.coordinates.length<2)
                        continue;


                    console.log('Checking for warning for '+u._id);

                    if(u.deviceTokens.length==0 || u.deviceTokens[0].length < 10) {
                        console.log('Skipping, invalid device token...');
                        continue;
                    }

                    (function(user) {
                        var c = user.lastLocation.coordinates;
                        Location.getLocationsByProximityAndDate(c[1],c[0],u.settings.warnRadius*1000,now,(err,locations) => {
                            if(err) {
                                log.backgroundError("Failed getting locations around user", err);
                            } else {
                                var n = locations.length;
                                console.log('Got ' + n +' flu cases around '+user._id);
                                if(n >= config.calc.minNewInfectionsForWarning) {
                                    user.lastWarningMessage = new Date();
                                    user.save();
                                    locales.setLocale(user.settings.locale);
                                    user.sendPushNotification({message:locales.__("PUSH_ALERT_FLU",n)});
                                }
                            }
                        });
                    })(u);
                }
            }
        });
    });
};
