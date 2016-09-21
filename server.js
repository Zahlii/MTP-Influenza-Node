'use strict';

const restify = require('restify');
const responseTime = require('response-time');
const routes  = require('./routes/');
const config  = require('config');
const monogooseInitiator = require('./model/index.js');
const log = require('./util/log.js');
const fs = require('fs');
const os  = require('os');
const onFinished = require('on-finished');



var settings = {
    name : config.get('Server.name')|| 'MTP'
};


if(os.hostname() == "wifo1-30") {
    settings.certificate = fs.readFileSync('/etc/letsencrypt/live/wifo1-30.bwl.uni-mannheim.de/fullchain.pem');
    settings.key = fs.readFileSync('/etc/letsencrypt/live/wifo1-30.bwl.uni-mannheim.de/privkey.pem');
}
const server = restify.createServer(settings);

server.use(responseTime({suffix:false}));
server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.queryParser());
server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.req = req;
    onFinished(res,(err,res) => {
        var r = res.getHeader("X-Response-Time");
        var url = res.req.url;
        var isWithCrypt = /(auth|register)/.test(url);
        res.req.responseTime = r;
        var time = isWithCrypt ? config.get("SLA.maxTimeBCrypt") : config.get("SLA.maxTime");
        if(r > time)
            log.APIError("High response time",null,res.req);

        console.log((new Date()).toLocaleString()+"\t"+res.req.method+"\t"+res.req.url+"\t"+r);
    });
    return next();
});
server.use(restify.gzipResponse());
server.pre(restify.pre.sanitizePath());


monogooseInitiator.initMongoose();
routes(server);



console.log('Server started.');
server.listen((process.env.PORT ||config.get('Server.port')), function () {
    console.log('%s listening at %s', server.name, server.url);
});
