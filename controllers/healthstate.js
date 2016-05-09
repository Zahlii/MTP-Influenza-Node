'use strict';
const restify = require('restify');
const Ajv = require('ajv');
const model = require('../model/setHealthstateAndLocation');

module.exports.reportHealthState = (req, res, next) => {
    const ajv = Ajv();
    const validate = ajv.compile(model.getJsonSchema());
    const valid = validate(req.body);
    if (!valid){
        res.send(400, validate.errors);
        return next()
    }
    else{
        model.setHealthStateAndLocation(req.body.userid, req.body.lat, req.body.lng, req.body.is_sick, req.body.is_newly_infected,
            req.body.health_score, req.body.has_headache, req.body.has_running_nose, req.body.has_sore_throat, req.body.has_limb_pain,
            req.body.has_fever, req.body.has_coughing, (err) => {
                if (err) {
                    res.send(new restify.InternalServerError(err.toString()));
                    return next();
                }
                else{
                    res.send(201);
                    return next();
                }
            }
        )
    }
};
