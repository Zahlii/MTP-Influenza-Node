'use strict';

const join = require('path').join;
const apn = require('apn');
const config = require('config');
const log = require('./log');

const pfx = join(__dirname, '../config/'+config.APN.certificate);
console.log('using PFX ' + pfx);

const options = {
    pfx: pfx,
    production: false,
    passphrase: config.APN.passphrase
};

const apnProvider = new apn.Provider(options);

module.exports.apnAgent = apnProvider;
module.exports.sendPushNotification = (device,data,cb) => {

    var msg = new apn.Notification();
    msg.alert = data.message;
    msg.payload = data;
    msg.payload._token = device;


    apnProvider.send(msg, device).then((result) => {

        if(cb)
            cb(result.failed ? result.failed : null);
    })
};
