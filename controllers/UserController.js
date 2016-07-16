'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');
const fb = require('fbgraph');


module.exports.authUser = (req, res, next) => {
    const bdy = req.body;

    if(!bdy.fbAuthToken) {
        res.send(500, new Error('No auth token supported'));
        return next();
    }

    fb.setAccessToken(bdy.fbAuthToken);

    var params = { fields: "email,age_range,birthday,gender,first_name,last_name,name" };

    fb.get("/me", params, function(err, fbres) {
        if (err) {res.send(500, err)}
        else {
            delete bdy.fbAuthToken;
            bdy.mail = "test@influenza.com"; // TODO not yet granted
            bdy.birthDate = new Date("1990-01-01"); // TODO not yet granted
            bdy.fbUserId = fbres.id;
            bdy.firstName = fbres.first_name;
            bdy.lastName = fbres.last_name;
            bdy.gender = fbres.gender === 'male' ? 'm' : 'f';

            User.getUserByFbId(bdy.fbUserId,(err,doc) => {
                if (err) {
                    res.send(500, err);
                    return next();
                }

                if(doc.length == 0) {
                    const u = new User(bdy);
                    u.save((err) => {
                        if (err) {res.send(500, err)}
                        else {
                            res.send(201,u);
                        }
                        return next()
                    });
                } else {
                    var u = doc[0];
                    res.send(201,u);
                }
            });


        }

    });


};
