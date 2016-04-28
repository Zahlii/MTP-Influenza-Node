var express = require('express'),
    port = process.env.PORT || 80,
	bodyParser = require('body-parser'),
    app = express();



// Set up view engine
app.set('views', __dirname + '/views');
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

// Set up static server folder
app.use(express.static(__dirname + '/www'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Load main app via controllers
app.use(require('./controllers'));

// Start server
app.listen(port, function () {
	console.log('Listening on port ' + port)
});



