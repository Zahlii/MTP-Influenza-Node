'use strict';
const mongoose = require('mongoose');
const HealthReport = mongoose.model('HealthReport');
const User = mongoose.model('User');
const Location = mongoose.model('Location');
const log = require('../util/log.js');
const time = require('../util/timing.js');
const Router = require('restify-router').Router;

module.exports = (server) => {
    const adminRouter = new Router();
    adminRouter.get('/info', info);
    adminRouter.get('/stats', stats);



    adminRouter.applyRoutes(server, '/admin');

};

function info(req, res, next) {
    res.send(200, {
        status: 'running',
        date: new Date().toISOString()
    });
    return next();
}
function getStats(collection,column,cb) {
    collection.aggregate([
        {
            $group: {
                _id: { $dateToString: {format:"%Y-%m-%d", date: "$"+column }},
                count: { $sum: 1 }
            }
        }
    ],cb);
}
function stats(req,res,next) {
    //getStats(User,'')
    getStats(Location,'timestamp',(err,l) => {
        getStats(HealthReport,'issuedOn',(err,hr) => {
            res.send(200,{
                Location:l,
                HealthReport:hr
            });
        });
    });
}
