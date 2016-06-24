/**
 * Created by sven on 24.06.16.
 */
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

// Connection URL
var conn = mongoose.connect('mongodb://localhost:27017/mtp-influenza/influenza');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    //Select database influenza
    mongoose.use('influenza');

    //User validation schema
    var healthReportSchema = new Schema({
        _id: ObjectId,
        userId: ObjectId, //Manual Reference
        locationId: ObjectId,
        isSick: {type: Boolean},
        healthScore: {type: int},
        issuedOn: {type: Date},
        validTo: {type, Date},
        symptoms:[{
            hasHeadache: {tpye: Boolean},
            hasRunningNose: {type: Boolean},
            hasSoreThroat: {type: Boolean},
            hasLimpPian: {type: Boolean},
            hasFever: {type: Boolean},
            hasCoughing: {type: Boolean}
        }],
        democraficData: [{
            age: {type: int},
            gender: {type: String, enum: ['m', 'w']}
        }]

    });

    var user = mongoose.model('user', healtReportSchema);
    db.close();
});


