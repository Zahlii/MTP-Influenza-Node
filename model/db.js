var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'myworkbook.de',
    user     : 'c4nenns',
    password : 'NasE08ZW6d',
    database : 'c4nenns'
});

connection.connect();

connection.query('SELECT 1+1 AS solution', function(err, rows, fields) {
    if (!err)
        console.log('The solution is: ', rows);
    else
        console.log('Error while performing Query.', err);
});

connection.end();