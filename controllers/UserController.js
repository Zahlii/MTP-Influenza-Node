'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');
const fb = require('fbgraph');
const bcrypt = require('bcrypt-nodejs');
const log = require('../util/log.js');

module.exports.registerUser = (req,res, next) => {
    const bdy = req.body;

    if(!bdy.deviceToken) {
        log.APIError('No device token supported during register',null,req);
        res.send(500, new Error('No device token supported'));
        return next();
    }

    User.find({mail:bdy.mail},(err,doc) => {
        if(err) {
            log.APIError('Error while searching user by mail',err,req);
            res.send(500,err);
            return next();
        }
        if(doc.length > 0) {
            log.APIError('Username is already in use',null,req);
            res.send(500, new Error('User already exists'));
            return next();
        }

        bdy.birthDate = new Date(bdy.birthDate);
        bdy.passwordHash = bcrypt.hashSync(bdy.password);
        bdy.deviceTokens = [bdy.deviceToken];
        bdy.lastLocation = {
            type:'Point',
            coordinates:[0,0]
        };

        delete bdy.password;
        delete bdy.deviceToken;

        const newUser = new User(bdy);

        newUser.save((err) => {
            if(err) {
                log.APIError('Error while saving new user',err,req);
                res.send(500,err);
            } else {
                res.send(201,newUser);
            }
            return next();
        });
    });


};
module.exports.authUser = (req,res, next) => {
    const bdy = req.body;

    if(!bdy.mail) {
        log.APIError('No mail supported during auth',null,req);
        res.send(500, new Error('No mail supported'));
        return next();
    }
    if(!bdy.deviceToken) {
        log.APIError('No device token supported during auth',null,req);
        res.send(500, new Error('No device token supported'));
        return next();
    }

    User.find({mail:bdy.mail},(err,doc) => {
        if(err) {
            log.APIError('Error while searching user by mail',err,req);
            res.send(500,err);
            return next();
        }
        if(doc.length == 0) {
            log.APIError('User not found during auth',null,req);
            res.send(500, new Error('User not found'));
            return next();
        }
        const u = doc[0];
        if(!bcrypt.compareSync(bdy.password,u.passwordHash)) {
            log.APIError('Invalid password supported during auth',null,req);
            res.send(500, new Error('Invalid password'));
            return next();
        }
        if(u.deviceTokens.indexOf(bdy.deviceToken) === -1) {
            u.deviceTokens.push(bdy.deviceToken);

            u.save((err) => {
                if (err) {
                    log.APIError('Could not save new device token',err,req);
                    res.send(500, err)
                }
                else {
                    res.send(201,u);
                }
                return next()
            });
        } else {
            res.send(201, u);
        }

    });
};

module.exports.authUserByFB = (req, res, next) => {
    const bdy = req.body;

    if(!bdy.fbAuthToken) {
        log.APIError('No FB auth token supported during auth',null,req);
        res.send(500, new Error('No auth token supported'));
        return next();
    }
    if(!bdy.deviceToken) {
        log.APIError('No device token supported during auth',null,req);
        res.send(500, new Error('No device token supported'));
        return next();
    }

    fb.setAccessToken(bdy.fbAuthToken);

    var params = { fields: "email,age_range,birthday,gender,first_name,last_name,name" };

    fb.get("/me", params, function(err, fbres) {
        if (err) {
            log.APIError('Could not query FB API',err,req);
            res.send(500, err)
        }
        else {
            delete bdy.fbAuthToken;
            bdy.mail = "test@influenza.com"; // TODO not yet granted
            bdy.birthDate = new Date("1990-01-01"); // TODO not yet granted
            bdy.fbUserId = fbres.id;
            bdy.firstName = fbres.first_name;
            bdy.lastName = fbres.last_name;
            bdy.gender = fbres.gender === 'male' ? 'm' : 'f';
            bdy.lastLocation = {
                type:'Point',
                coordinates:[0,0]
            };

            User.getUserByFbId(bdy.fbUserId,(err,doc) => {
                if (err) {
                    log.APIError('Error while searching user by FB ID',err,req);
                    res.send(500, err);
                    return next();
                }

                if(doc.length == 0) {
                    const u = new User(bdy);
                    u.deviceTokens.push(bdy.deviceToken);
                    u.lastHealthReport = null;
                    u.lastHealthstateReminder = null;
                    u.save((err) => {
                        if (err) {
                            log.APIError('Error while saving new FB user',err,req);
                            res.send(500, err);
                        }
                        else {
                            res.send(201,u);
                        }
                        return next()
                    });
                } else {
                    var u = doc[0];



                    if(u.deviceTokens.indexOf(bdy.deviceToken) === -1) {
                        u.deviceTokens.push(bdy.deviceToken);

                        u.save((err) => {
                            if (err) {
                                res.send(500, err);
                                log.APIError('Could not save new device token',err,req);
                            }
                            else {
                                res.send(201,u);
                            }
                            return next()
                        });
                    } else {
                        res.send(201, u);
                    }
                }
            });


        }

    });
};

module.exports.sendPushNotification = (req,res,next) => {
    const bdy = req.body;
    User.findById(bdy._user, (err, doc) => {
        if (err) {
            log.APIError('Error while searching user by ID',err,req);
            res.send(500, err);
            return next();
        } else if (doc == null) {
            log.APIError('Could not find user for push notifications',null,req);
            res.send(500, new Error('Unknown user ' + bdy._user+'.'));
            return next();
        } else {
            doc.sendPushNotification({
                message: 'Test Notification'
            },(err, info)=> {
                if (err) {
                    log.APIError('Error while sending push notification',err,req);
                    res.send(500, err);
                } else {
                    res.send(200, info);
                }
                return next();
            });
        }
    });
};
