'use strict';

const join = require('path').join;
const pfx = join(__dirname, '../config/influenza_push_service.p12');
const apnagent = require('apnagent');
const agent = new apnagent.Agent();
const config = require('config');
const log = require('./log');

agent.set('pfx file', pfx);
agent.set('passphrase',config.APN.passphrase);
agent.enable('sandbox');

agent.connect(function (err) {

    if (err && err.name === 'GatewayAuthorizationError') {
        console.log('Authentication Error: %s', err.message);
    } else if (err) {
        throw err;
    }


    var env = agent.enabled('sandbox')
        ? 'sandbox'
        : 'production';

    console.log('apnagent [%s] gateway connected', env);
});

agent.on('message:error', function (err, msg) {

    log.captureException("APN " + err.name + ":" + err.message, {
        tags:{
            App:'NODE_APN'
        },
        extra:{
            err:err,
            message:msg
        }
    });
    switch (err.name) {
        // This error occurs when Apple reports an issue parsing the message.
        case 'GatewayNotificationError':

            console.log('[message:error] GatewayNotificationError: %s', err.message);

            // The err.code is the number that Apple reports.
            // Example: 8 means the token supplied is invalid or not subscribed
            // to notifications for your application.
            if (err.code === 8) {
                console.log('    > %s', msg.device().toString());
                // In production you should flag this token as invalid and not
                // send any futher messages to it until you confirm validity
            }

            break;

        // This happens when apnagent has a problem encoding the message for transfer
        case 'SerializationError':
            console.log('[message:error] SerializationError: %s', err.message);
            break;

        // unlikely, but could occur if trying to send over a dead socket
        default:
            console.log('[message:error] other error: %s', err.message);
            break;
    }
});

module.exports.apnAgent = agent;
module.exports.sendPushNotification = (device,data,cb) => {

    console.log('Using token: '+device);

    var msg = agent.createMessage()
        .device(device)
        .alert(data.message);

    for(var prop in data) {
        if(data.hasOwnProperty(prop))
            msg = msg.set(prop,data[prop]);
    }

    msg.send(cb);
};
