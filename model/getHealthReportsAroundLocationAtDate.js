'use strict';
module.exports = {
    getHealthReportsAroundLocationAtDate: (lat, lng, date, done) => {
        const pool = require('./mysql_conn_pool').getPool();

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
};
