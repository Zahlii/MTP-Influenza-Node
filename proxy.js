const http = require('http');
const httpProxy = require('http-proxy');
const HttpProxyRules = require('http-proxy-rules');

const config  = require('config');
const log = require('./util/log.js');
const os  = require('os');

const port_static = config.get('Server.port_static') || 8081;
const port_api = config.get('Server.port_api') || 8082;

var proxyRules = new HttpProxyRules({
    rules: {
        '.*/visualize/?': 'https://localhost:'+port_static+'/visualize/',  // Data visualization
        '.*/www/?': 'https://localhost:'+port_static+'/www/',  // Other statics
        '.*/api1/?': 'https://localhost:'+port_api+'/api1/',   // API
        '.*/admin/?': 'https://localhost:'+port_api+'/admin/',   // API
    }
});


var settings = {ssl:{}};

if(os.hostname() == "wifo1-30") {
    settings.ssl.cert = fs.readFileSync('/etc/letsencrypt/live/wifo1-30.bwl.uni-mannheim.de/fullchain.pem');
    settings.ssl.key = fs.readFileSync('/etc/letsencrypt/live/wifo1-30.bwl.uni-mannheim.de/privkey.pem');
}


var proxy = httpProxy.createProxy(settings);


http.createServer(function(req, res) {

    var target = proxyRules.match(req);

    if (target) {
        return proxy.web(req, res, {
            target: target
        });
    }

    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('No rule found for this request');

}).listen(process.env.PORT ||config.get('Server.port'),function () {
    log.info('Proxy started.');
});