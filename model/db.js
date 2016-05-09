 'use strict'
module.exports = {
    getHealthReportsAroundLocationAtDate: (lat, lng, date, done) => {
        const pool = require('./mysql_conn_pool').getPool()

        var ts = date.getTime(),
            ts = ts - ts % 86400 * 1000,
            dateStart = new Date(ts),
            dateEnd = new Date(ts + 86400 * 1000);

        pool.query(
            'SELECT lat, lng, health_score, distance(lat,lng,?,?) AS distance FROM health_report'
            + ' JOIN location ON health_report.location_id = location.id'
            + ' WHERE is_sick = 1 AND time_observed BETWEEN ? AND ? HAVING distance < 60000', [lat, lng, dateStart, dateEnd], function (err, rows, fields) {
                if (err) {
                    console.log(err)
                }
                done(err, rows, fields);
            }
        );
    },
    setHealthStateAndLocation: (userid, lat, lng, is_sick, is_newly_infected, health_score, has_headache, has_running_nose, has_sore_throat,
                                has_limb_pain, has_fever, has_coughing, cb) => {
        const pool = require('./mysql_conn_pool').getPool()
        pool.getConnection((err, connection) =>{
            connection.beginTransaction()
            connection.query('INSERT INTO `location` (`user_id`,`lat`,`lng`,`time_observed`) VALUES (?,?,?,now())', [userid, lat, lng], (err) => {
            if (err) {
                console.log(err)
                connection.rollback()
                connection.release()
                return cb(err)
            }else{
                connection.query('INSERT INTO `health_report` (`user_id`, `location_id`,`is_sick`,`is_newly_infected`,`health_score`,`has_headache`,' +
                    '`has_running_nose`,`has_sore_throat`,`has_limb_pain`,`has_fever`,`has_coughing`)' +
                    'VALUES(?,last_insert_id(),?,?,?,?,?,?,?,?,?)', [userid, is_sick, is_newly_infected, health_score, has_headache, has_running_nose, has_sore_throat, has_limb_pain, has_fever, has_coughing],
                    (err) => {
                        if (err){
                            console.log(err)
                            connection.rollback()
                            connection.release()
                            return cb(err)
                        } else {
                            connection.commit()
                            connection.release()
                            return cb()
                        }
                    })
            }
            })
        })
    }
};
