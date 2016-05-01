var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'myworkbook.de',
    user     : 'c4nenns',
    password : 'NasE08ZW6d',
    database : 'c4nenns'
});

connection.connect();

module.exports.getHealthReportsAroundLocationAtDate = function(lat, lng, date, done) {
    var ts = date.getTime(),
        ts = ts - ts % 86400*1000,
        dateStart = new Date(ts),
        dateEnd = new Date(ts + 86400*1000);

    connection.query(
        'SELECT lat, lng, health_score, distance(lat,lng,?,?) AS distance FROM health_report'
        +' JOIN location ON health_report.location_id = location.id'
        +' WHERE time_sent BETWEEN ? AND ? HAVING distance < 60000',[lat,lng,dateStart,dateEnd],function(err, rows, fields) {
            done(err,rows,fields);
        }
    );
};