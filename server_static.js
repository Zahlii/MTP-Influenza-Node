'use strict';

const restify = require('restify');
const config  = require('config');
const log = require('./util/log.js');
const fs = require('fs');
const os  = require('os');

require('pmx').init({
    http : true
});

log.info('CWD is: ' + process.cwd());

var settings = {
    name : config.get('Server.name_static')|| 'MTP_Static'
};


if(os.hostname() == "wifo1-30") {
    settings.certificate = fs.readFileSync('/etc/letsencrypt/live/wifo1-30.bwl.uni-mannheim.de/fullchain.pem');
    settings.key = fs.readFileSync('/etc/letsencrypt/live/wifo1-30.bwl.uni-mannheim.de/privkey.pem');
}

const server = restify.createServer(settings);

server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.queryParser());
server.on('uncaughtException', function (req, res, route, err, cb) {
    log.err(err);
    //res.send(500, 'Internal Error')
    log.staticError('Uncaught Exception', req, err);
});

server.use(restify.gzipResponse());
server.pre(restify.pre.sanitizePath());



server.get(/\/visualize\/?.*/, restify.serveStatic({
    directory: __dirname + "/www",
    default: 'index.html'
}));
server.get(/\/www\/?.*/, restify.serveStatic({
    directory: __dirname,
    default: 'index.html'
}));

const PORT = process.env.PORT ||config.get('Server.port_static');

server.listen(PORT, function () {
    log.info('API Server started on '+PORT);
});
