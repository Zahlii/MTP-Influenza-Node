const fs = require('fs');
const spawn = require('threads').spawn;

module.exports = function(log) {
    fs.readdirSync('./workers').forEach((file) => {
        if (file.substr(-3, 3) === '.js' && file !== 'index.js') {
            var w = spawn('./workers/' + file).on('message', function(message) {
                log.info("Worker "+file+" message: " + message);
            }).on('error', function(message) {
                log.error("Worker "+file+" error",message);
            }).on('exit', function() {
                log.info("Worker "+file+" exited");
            }).send();
        }
    });
};

