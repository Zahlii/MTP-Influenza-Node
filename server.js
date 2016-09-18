'use strict';

const restify = require('restify');

const routes  = require('./routes/');
const config  = require('config');
const monogooseInitiator = require('./model/index.js');
const log = require('./config/log.js');
const fs = require('fs');
const os  = require('os');



var settings = {
    name : config.get('Server.name')|| 'MTP'
};


if(os.hostname() == "wifo1-30") {
    settings.certificate = fs.readFileSync('/etc/letsencrypt/live/wifo1-30.bwl.uni-mannheim.de/fullchain.pem');
    settings.key = fs.readFileSync('/etc/letsencrypt/live/wifo1-30.bwl.uni-mannheim.de/privkey.pem');
}
const server = restify.createServer(settings);


server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.queryParser());
server.use((req, res, next) => {
    console.log(req.method+" "+req.url);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
});
server.use(restify.gzipResponse());
server.pre(restify.pre.sanitizePath());



routes(server);
monogooseInitiator.initMongoose();


console.log('Server started.');
server.listen((process.env.PORT ||config.get('Server.port')), function () {
    console.log('%s listening at %s', server.name, server.url);
});
