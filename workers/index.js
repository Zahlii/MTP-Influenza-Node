const fs = require('fs');
const spawn = require('threads').spawn;
const log = require('../util/log.js');

module.exports = function() {
    fs.readdirSync('./workers').forEach((file) => {
        if (file.substr(-3, 3) === '.js' && file !== 'index.js') {
            console.log(file);
            var w = spawn('./workers/' + file).on('message', function(message) {
                log.captureMessage("Worker "+file+" message: " + message,{
                    tags:{
                        App:'NODE_BACKGROUND',
                        BackgroundFile:file
                    }
                });
            }).on('error', function(message) {
                log.captureException(new Error("Worker "+file+" error"),{
                    tags:{
                        App:'NODE_BACKGROUND',
                        BackgroundFile:file
                    }
                });
            }).on('exit', function() {
                log.captureMessage("Worker "+file+" exited",{
                    tags:{
                        App:'NODE_BACKGROUND',
                            BackgroundFile:file
                    }
                });
            }).send();
        }
    });
};

