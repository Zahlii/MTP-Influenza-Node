'use strict'

const schema = {
    "type": "object",
    "properties": {
        "userid": {
            "type": "integer"
        },
        "lat": {
            "type": "number",
            "minimum": -90,
            "maximum": 90,
        },
        "lng": {
            "type": "number",
            "minimum": -180,
            "maximum": 180,
        },
        "is_sick": {
            "type": "integer",
            "minimum": 0,
            "maximum": 1,
        },
        "is_newly_infected": {
            "type": "integer",
            "minimum": 0,
            "maximum": 1,
        },
        "health_score": {
            "type": "number",
            "minimum": 0,
            "maximum": 100,
        },
        "has_headache": {
            "type": "integer",
            "minimum": 0,
            "maximum": 1,
        },
        "has_running_nose": {
            "type": "integer",
            "minimum": 0,
            "maximum": 1,
        },
        "has_sore_throat": {
            "type": "integer",
            "minimum": 0,
            "maximum": 1,
        },
        "has_limb_pain": {
            "type": "integer",
            "minimum": 0,
            "maximum": 1,
        },
        "has_fever": {
            "type": "integer",
            "minimum": 0,
            "maximum": 1,
        },
        "has_coughing": {
            "type": "integer",
            "minimum": 0,
            "maximum": 1,
        }
    },
    "required": ["userid", "lat", "lng", "is_sick", "is_newly_infected", "health_score", "has_headache", "has_running_nose", "has_sore_throat", "has_limb_pain", "has_fever", "has_coughing"]
}

module.exports = {
    setHealthStateAndLocation: (userid, lat, lng, is_sick, is_newly_infected, health_score, has_headache, has_running_nose, has_sore_throat,
                                has_limb_pain, has_fever, has_coughing, cb) => {
        const pool = require('./mysql_conn_pool').getPool();
        pool.getConnection((err, connection) => {
            connection.beginTransaction();
            connection.query('INSERT INTO `location` (`user_id`,`lat`,`lng`,`time_observed`) VALUES (?,?,?,now())', [userid, lat, lng], (err) => {
                if (err) {
                    console.log(err);
                    connection.rollback();
                    connection.release();
                    return cb(err)
                } else {
                    connection.query('INSERT INTO `health_report` (`user_id`, `location_id`,`is_sick`,`is_newly_infected`,`health_score`,`has_headache`,' +
                        '`has_running_nose`,`has_sore_throat`,`has_limb_pain`,`has_fever`,`has_coughing`)' +
                        'VALUES(?,last_insert_id(),?,?,?,?,?,?,?,?,?)', [userid, is_sick, is_newly_infected, health_score, has_headache, has_running_nose, has_sore_throat, has_limb_pain, has_fever, has_coughing],
                        (err) => {
                            if (err) {
                                console.log(err);
                                connection.rollback();
                                connection.release();
                                return cb(err);
                            } else {
                                connection.commit();
                                connection.release();
                                return cb();
                            }
                        })
                }
            })
        })
    },
    getJsonSchema: () => {
        return schema
    }
}
