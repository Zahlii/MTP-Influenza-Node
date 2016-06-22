var MongoClient = require('mongodb').MongoClient;

// Connection URL
var url = 'mongodb://localhost:27017/mtp-influenza';

// Use connect method to connect to the server
MongoClient.connect(url, function (err, db) {
    if (err != null) {
        console.log('Error connecting to MongoDB: ' + err.message);
    } else {
        console.log('Connected successfully to MongoDB');
        var test = db.collection('test');
        test.find({},{},function(e,docs){
            console.log(docs);
        });
    }
    db.close();
});
