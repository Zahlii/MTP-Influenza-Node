/**
 * Created by sven on 24.06.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Connection URL
var conn = mongoose.connect('mongodb://localhost:27017/mtp-influenza');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!



    //User validation schema
    var locationSchema = new Schema({
        _id: Schema.Types.ObjectId,
        lat: {type: Float},
        long: {type: Float},
        timestamp: {type: Timestamp},
        isNewlyInfected: {type: Boolean},
        healthReportId: ObjectId
    });

    var user = mongoose.model('user', locationSchema);
    db.close();
});


