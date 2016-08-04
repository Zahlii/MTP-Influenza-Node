function scheduleEvery(seconds,fn) {
    fn();
    setInterval(fn,1000*seconds);
}


const mongoose = require('mongoose');
const monogooseInitiator = require('../model/index.js');
monogooseInitiator.initMongoose();
const User = mongoose.model('User');
const HealthReport = mongoose.model('HealthReport');

module.exports = function(input, done) {
    scheduleEvery(5,function() {
        HealthReport.find({validTo:null},(err,result) => {
            console.log(result);
        });
    });
};
