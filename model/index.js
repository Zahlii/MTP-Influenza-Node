'use strict';
const config  = require('config');
const fs = require('fs');
const os = require('os');
const log = require('../util/log');
const mongoconfig = config.get('MongoDB');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

let initialized = false;

module.exports.initMongoose = () => {
    if (!initialized) {

        var h = mongoconfig.host;

        //if(os.hostname() != "wifo1-30" && os.hostname() != "vm-debian")
        //    h = "mongodb://wifo1-30.bwl.uni-mannheim.de:27016/mtp-influenza";

        mongoose.connect(h, mongoconfig.options);
        log.info('Connected to '+h);
        fs.readdirSync('./model').forEach((file) => {
            if (file.substr(-3, 3) === '.js' && file !== 'index.js') {
                const classname = file.replace('.js', '');
                const schema = require('./' + classname).Schema;
                if(!schema)
                    return;
                mongoose.model(classname, schema);
            }

        });
        initialized = true
    }
};
