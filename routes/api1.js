'use strict';
const Router = require('restify-router').Router;

module.exports = (server) => {
    const api1router = new Router();

    api1router.put('/healthstate', (req, res, next) => {
        require('../controllers/HealthReportController')
            .createHealthReport(req, res, next);
        return next();
    });

    api1router.put('/user/auth', (req, res, next) => {
        require('../controllers/UserController')
            .authUserByFB(req, res, next)
        return next();
    });

    api1router.put('/user/authnormal', (req, res, next) => {
        require('../controllers/UserController')
            .authUser(req, res, next)
        return next();
    });

    api1router.put('/user/register', (req, res, next) => {
        require('../controllers/UserController')
            .registerUser(req, res, next)
        return next();
    });

    api1router.put('/location/report', (req, res, next) => {
        require('../controllers/LocationController')
            .reportLocation(req, res, next, false)
        return next();
    });

    api1router.put('/location/get', (req, res, next) => {
        require('../controllers/LocationController')
            .getLocationsByProximityAndDate(req, res, next)
        return next();
    });

    api1router.put('/push', (req, res, next) => {
        require('../controllers/UserController')
            .sendPushNotification(req, res, next)
        return next();
    });

    api1router.put('/kpi/new_infections', (req, res, next) => {
        require('../controllers/KPIController')
            .getNewInfectionsAroundUserAtDate(req, res, next)
        return next();
    });

    api1router.get('/tiles/:z/:x/:y.png', (req, res, next) => {
        require('../controllers/TileController')
            .renderTile(req, res, next)
        return next();
    });

    api1router.applyRoutes(server, '/api1');

};
