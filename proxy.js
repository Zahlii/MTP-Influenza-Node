const http = require('http');
const httpProxy = require('http-proxy');
const HttpProxyRules = require('http-proxy-rules');

const config  = require('config');
const log = require('./util/log.js');


var proxyRules = new HttpProxyRules({
    rules: {
        '.*/visualize/?': 'http://localhost:8081/visualize/',  // Data visualization
        '.*/www/?': 'http://localhost:8081/www/',  // Other statics
        '.*/api1/?': 'http://localhost:8080/api1/',   // API
        '.*/admin/?': 'http://localhost:8080/admin/',   // API
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

}).listen(80,function () {
    log.info('Proxy started.');
});