'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');


module.exports.createUser = (req, res, next) => {
    const bdy = req.body;
    bdy.birthDate = new Date(bdy.birthDate);
    bdy.passwordHash = bdy.password;
    const user = new User(bdy);
    user.save((err) => {
        if (err) {res.send(500, err)}
        else {
            res.send(201);
        }
        return next()
    })
};
