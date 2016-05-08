'use strict';
const config  = require('config');
const mysql = require('mysql');
var pool;

module.exports.getPool = () => {
        if (!pool) {
            pool = mysql.createPool(config.get('MySQL'))
        }
        return pool
    }
