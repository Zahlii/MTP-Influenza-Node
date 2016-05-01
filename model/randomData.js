var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'myworkbook.de',
    user     : 'c4nenns',
    password : 'NasE08ZW6d',
    database : 'c4nenns'
});

var numberOfUsers = 1000,
    numberOfHealthReports = 5000,
    maxLat = 50, minLat = 48,
    maxLng = 9, minLng = 8,
    firstDate =new Date(),
    now = new Date().getTime();

firstDate.setDate(firstDate.getDate() - 21);


connection.connect(function(err) {
    console.log("Start");
    /*for(var i=0;i<numberOfUsers;i++) {
        connection.query('INSERT INTO user VALUES (0,?,?,?,?,?)',["hallo@welt.com",getRandomYear(),123,"xyz",getRandomGender()],function(err,result) {
            if(err) {
                console.log(err);
            }
        });
    }*/
    setTimeout(function() {

        for(var j=0;j<numberOfHealthReports;j++) {
            insert_report(j);
        }
    },10);

});


function insert_report(i) {

    var isSick = Math.random()>0.9,
        dt = getRandomDate(),
        pos = getRandomPos(),
        uid = getRandomUserID(),
        healthScore = isSick ?  rnd(0,80) : 100;

    connection.query('INSERT INTO location VALUES(0,?,?,?,?)',[uid,pos.lat,pos.lng,dt],function(err,result) {
        if(err) {
            console.log("E1" + err);
        }
        if(i%25==0 || i==numberOfHealthReports-1)
            console.log(i);
        connection.query('INSERT INTO health_report (user_id,location_id,is_sick,health_score) VALUES (?,?,?,?)',[uid,result.insertId,isSick?1:0,healthScore],function(err,result) {
            if(err) {
                console.log("E2" + err);
            }
            if(i%25==0 || i==numberOfHealthReports-1)
                console.log(i);
        });
    });
}



function rnd(min,max) {
    return min+Math.random()*(max-min);
}
function getRandomUserID() {
    return Math.round(rnd(1,numberOfUsers));
}
function getRandomDate() {
    return new Date(rnd(firstDate.getTime(),now));
}
function getRandomPos() {
    return {
        lat:rnd(minLat,maxLat),
        lng:rnd(minLng,maxLng)
    }
}
function getRandomYear() {
    return Math.round(rnd(1950,2008));
}
function getRandomGender() {
    return Math.random()>0.51 ? "M" : "F";
}

