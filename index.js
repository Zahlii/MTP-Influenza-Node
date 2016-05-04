var express = require('express'),
    port = process.env.PORT || 80,
	bodyParser = require('body-parser'),
	compression = require('compression');
    app = express();

global.API_VERSION = 1;


app.use(function(req, res, next){
	var start = new Date;

	res.on('finish', function(){
		var duration = new Date - start;
		console.log("[" +start.toJSON() + "] " + req.connection.remoteAddress + " | " + req.method + " " + req.originalUrl +" | "+ res.statusCode +" | " +duration+"ms");
	});
    next();
});

// Set up view engine
app.set('views', __dirname + '/views');
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

app.use(compression());

// Set up static server folder
app.use(express.static(__dirname + '/www'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Load main app via controllers
app.use(require('./controllers'));

// Start server
app.listen(port, function () {
	console.log('Listening on port ' + port);
	console.log('Root path = /api/'+global.API_VERSION+'/');
});



