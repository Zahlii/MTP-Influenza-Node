'use strict';

const restify = require('restify');
const bunyan  = require('bunyan');
const routes  = require('./routes/');
const config  = require('config');
const monogooseInitiator = require('./model/index.js');
const fs = require('fs');
const os  = require('os');

const log = bunyan.createLogger({
    name        : 'logger',
    level       : config.get('log_level'),
    streams: [
        {
            path: 'restify.log',
            level: 'trace'
        }
    ],
    serializers : bunyan.stdSerializers
});

var settings = {
    name : config.get('Server.name')|| 'MTP',
    log  : log
};


if(os.hostname() == "wifo1-30") {
    settings.certificate = fs.readFileSync('/etc/letsencrypt/live/wifo1-30.bwl.uni-mannheim.de/fullchain.pem');
    settings.key = fs.readFileSync('/etc/letsencrypt/live/wifo1-30.bwl.uni-mannheim.de/privkey.pem');
}
const server = restify.createServer(settings);


server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.queryParser());
server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
});
server.use(restify.gzipResponse());
server.pre(restify.pre.sanitizePath());


server.on('after', restify.auditLogger({ log: log }));
//server.on('uncaughtException', restify.auditLogger({ log: log }));

routes(server);
monogooseInitiator.initMongoose();


log.info('Server started.');
server.listen((process.env.PORT ||config.get('Server.port')), function () {
    log.info('%s listening at %s', server.name, server.url);
});
