'use strict'

module.exports ={
    setHealthStateAndLocation: (userid, lat, lng, is_sick, is_newly_infected, health_score, has_headache, has_running_nose, has_sore_throat,
                                has_limb_pain, has_fever, has_coughing, cb) => {
        const pool = require('./mysql_conn_pool').getPool();
        pool.getConnection((err, connection) =>{
            connection.beginTransaction();
            connection.query('INSERT INTO `location` (`user_id`,`lat`,`lng`,`time_observed`) VALUES (?,?,?,now())', [userid, lat, lng], (err) => {
                if (err) {
                    console.log(err);
                    connection.rollback();
                    connection.release();
                    return cb(err)
                }else{
                    connection.query('INSERT INTO `health_report` (`user_id`, `location_id`,`is_sick`,`is_newly_infected`,`health_score`,`has_headache`,' +
                        '`has_running_nose`,`has_sore_throat`,`has_limb_pain`,`has_fever`,`has_coughing`)' +
                        'VALUES(?,last_insert_id(),?,?,?,?,?,?,?,?,?)', [userid, is_sick, is_newly_infected, health_score, has_headache, has_running_nose, has_sore_throat, has_limb_pain, has_fever, has_coughing],
                        (err) => {
                            if (err){
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
    }
}
