'use strict';
const config  = require('config');
const fs = require('fs');
const mongoconfig = config.get('MongoDB');
const mongoose = require('mongoose');

let initialized = false;

module.exports.initMongoose = () => {
    if (!initialized) {
        mongoose.connect(mongoconfig.host, mongoconfig.options);
        fs.readdirSync('./model').forEach((file) => {
            if (file.substr(-3, 3) === '.js' && file !== 'index.js') {
                const classname = file.replace('.js', '')
                const schema = require('./' + classname).Schema;
                if(!schema)
                    return;
                mongoose.model(classname, schema);
            }

        });
    initialized = true
    }
};
