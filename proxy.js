const http = require('http');
const httpProxy = require('http-proxy');
const HttpProxyRules = require('http-proxy-rules');

const config  = require('config');
const log = require('./util/log.js');


const port_static = config.get('Server.port_static') || 8081;
const port_api = config.get('Server.port_api') || 8082;

var proxyRules = new HttpProxyRules({
    rules: {
        '.*/visualize/?': 'http://localhost:'+port_static+'/visualize/',  // Data visualization
        '.*/www/?': 'http://localhost:'+port_static+'/www/',  // Other statics
        '.*/api1/?': 'http://localhost:'+port_api+'/api1/',   // API
        '.*/admin/?': 'http://localhost:'+port_api+'/admin/',   // API
    }
});


var proxy = httpProxy.createProxy();


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