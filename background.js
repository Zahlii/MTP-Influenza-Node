'use strict';


const config  = require('config');
const bunyan  = require('bunyan');






const log = bunyan.createLogger({
    name        : 'logger',
    level       : config.get('log_level'),
    streams: [
        {
            stream: process.stdout,
            level: 'debug'
        },
        {
            path: 'background.log',
            level: 'trace'
        }
    ],
    serializers : bunyan.stdSerializers
});



const worker = require('./workers/index.js')(log);



