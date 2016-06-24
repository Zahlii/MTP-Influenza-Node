/**
 * Created by sven on 24.06.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Connection URL
var conn = mongoose.connect('mongodb://localhost:27017/mtp-influenza/influenza');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!


    //User validation schema
    var healthReportSchema = new Schema({
        _id: Schema.Types.ObjectId,
        userId: Schema.Types.ObjectId, //Manual Reference
        locationId: Schema.Types.ObjectId,
        isSick: {type: Boolean},
        healthScore: {type: Boolean},
        issuedOn: {type: Date},
        validTo: {type: Date},
        hasHeadache: {tpye: Boolean},
        hasRunningNose: {type: Boolean},
        hasSoreThroat: {type: Boolean},
        hasLimpPian: {type: Boolean},
        hasFever: {type: Boolean},
        hasCoughing: {type: Boolean},
        age: {type: Boolean},
        gender: {type: String, enum: ['m', 'w']}
    });

    var user = mongoose.model('user', healthReportSchema);
    db.close();
});


