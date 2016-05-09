'use strict';
const Router = require('restify-router').Router;

module.exports = (server) => {
    const api1router = new Router();
    api1router.get('/now/:lat/:lng', (req, res, next) => {
        require('../controllers/heatmap')
            .displayHeatmapData(req.params.lat,req.params.lng,new Date(),res);
        return next();
    });

    api1router.put('/healthstate', (req, res, next) => {
        require('../controllers/healthstate')
            .reportHealthState(req, res, next);
        return next();
    });

    api1router.get('/history/:date/:lat/:lng', (req, res, next) => {
        require('../controllers/heatmap')
            .displayHeatmapData(req.params.lat,req.params.lng,new Date(req.params.date),res)
        return next();
    });


    api1router.applyRoutes(server, '/api1');

};
