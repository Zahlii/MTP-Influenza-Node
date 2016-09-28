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

module.exports = function(input, done) {
    scheduleEvery(600,function() {
        const dt = new Date(Date.now()-config.calc.warningTimeInterval*1000);
        const now = new Date();

        User.find({
            $or: [
                {
                    lastWarningPushNotification: {
                        $lt: dt
                    }
                },
                {
                    lastWarningPushNotification: null
                }
            ]
        },(err,result) => {
            if(err) {
                log.backgroundError("Failed getting users based on last warning", err);
            } else {
                //console.log(result);
                for(var i=0;i<result.length;i++) {
                    var u = result[i];
                    if(!u.lastLocation || u.lastLocation.coordinates.length<2)
                        continue;

                    var c = u.lastLocation.coordinates;
                    console.log('Checking for warning for '+u._id);

                    (function(user) {
                        Location.getLocationsByProximityAndDate(c[1],c[0],u.settings.warnRadius*1000,now,'-_id -_healthReport -__v -geo.type',(err,locations) => {
                            if(err) {
                                log.backgroundError("Failed getting locations around user", err);
                            } else {
                                var n = locations.length;
                                console.log('Got ' + n +' flu cases around '+user._id);
                                if(n >= config.calc.minNewInfectionsForWarning) {
                                    user.lastWarningPushNotification = new Date();
                                    user.save();
                                    user.sendPushNotification({message:"Flu alert! Today there were " + n +" new flu infections in your warning area."});
                                }
                            }
                        });
                    })(u);
                }
            }
        });
    });
};
