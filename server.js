'use strict';

const restify = require('restify');
const responseTime = require('response-time');
const timing = require('./util/timing.js');
const routes  = require('./routes/');
const config  = require('config');
const monogooseInitiator = require('./model/index.js');
const log = require('./util/log.js');
const fs = require('fs');
const os  = require('os');
const onFinished = require('on-finished');

require('pmx').init({
    http : true
});

log.info('CWD is: ' + process.cwd());

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
    timing.start(req);
    res.info =  {
        method: req.method,
        url: req.url,
        body: req.body,
        responseTime: 0,
        timing:req.timing
    };
    onFinished(res,(err,res) => {
        var r = res.getHeader("X-Response-Time");
        var url = res.info.url;
        var isWithCrypt = /(auth|register)/.test(url);
        res.info.responseTime = r;
        var time = isWithCrypt ? config.get("SLA.maxTimeBCrypt") : config.get("SLA.maxTime");
        if(r > time)
            log.APIError("High response time",null,res.info);

        log.info(res.info.method+"\t"+res.info.url+"\t"+r);
    });
    return next();
});
server.on('uncaughtException', function (req, res, route, err, cb) {
    log.err(err);
    //res.send(500, 'Internal Error')
    //log.APIError('Uncaught Exception', req, err);
});

//server.use(restify.gzipResponse());
server.pre(restify.pre.sanitizePath());


monogooseInitiator.initMongoose();
routes(server);


log.info('Server started.');
server.listen((process.env.PORT ||config.get('Server.port')), function () {
    log.info('%s listening at %s', server.name, server.url);
});
