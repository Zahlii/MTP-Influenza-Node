'use strict';
const Router = require('restify-router').Router;

module.exports = (server) => {
    const adminRouter = new Router();
    adminRouter.get('/info', info);



    adminRouter.applyRoutes(server, '/admin');

};

function info(req, res, next) {
    res.send(200, {
        status: 'running',
        date: new Date().toISOString()
    });
    return next();
}
