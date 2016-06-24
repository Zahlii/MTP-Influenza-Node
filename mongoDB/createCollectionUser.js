/**
 * Created by sven on 24.06.16.
 */
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

// Connection URL
var conn = mongoose.connect('mongodb://localhost:27017/mtp-influenza');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    //Select database influenza
    mongoose.use('influenza');

    //User validation schema
    var userSchema = new Schema({
        _id: ObjectId,
        mail:  {type:String, required:true},
        birth_year: {type:String, required:true},
        password_hash: {type: String, reqquired:true},
        full_name: {type: String, required:true},
        gender: {type: String, required: true, enum:['m','w'] }

    });

    var user = mongoose.model('user', userSchema);
    db.close();
});


