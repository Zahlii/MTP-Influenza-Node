const http = require('request');
const os = require('os');
const argv = require('optimist')
    .default('u', 1)
    .default('l', 1)
    .argv;

const base = os.hostname() == "wifo1-30" ? "https://wifo1-30.bwl.uni-mannheim.de:8080" : "http://localhost:8080";

var ID = 1;

const DEL = ';';

function putRequest(url, data,cb) {
    url = base + url;

    //var t = Date.now();

    http({
        url: url,
        method: 'PUT',
        json: data,
        time: true
    },
    (err,res,bdy) => {


        if(err)
            console.log(err);
        else {
            var time = res.elapsedTime;
            var status = res.statusCode;
            var responseSize = res.headers['content-length'];
            var t = res.headers['x-response-time'];

            console.log((ID++)+DEL+(new Date()).toLocaleString() + DEL+'PUT'+DEL+url+DEL+t+DEL+time+DEL+status+DEL+responseSize+DEL+(status == 500 ? bdy.message : ''));
        }


        if(cb && typeof cb === 'function')
            cb(bdy);
    });
}

function rbool() {
    return Math.random()>0.5;
}
function  rnd(min,max) {
    return((Math.random()*(max-min)+min));
}
function rlat() {
    return rnd(49,50);
}
function rlng() {
    return rnd(8,9);
}
function rstring(n) {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, n);
}
function rmail() {
    return rstring(8)+"@"+rstring(8)+".de";
}
function rdate() {
    return new Date(rnd(0.8,0.9)*Date.now());
}
console.log('ID'+DEL+'DATE'+DEL+'METHOD'+DEL+'URL'+DEL+'PROCESSING TIME[MS]'+DEL+'TOTAL TIME[MS]'+DEL+'HTTP STATUS'+DEL+'RESPONSE SIZE'+DEL+'ERROR');

function run() {
    var mail = rmail(),
        pass = rstring(10);

    putRequest("/api1/user/register", {
        mail: mail,
        password: pass,
        gender: rbool() ? 'm' : 'f',
        firstName: 'testuser',
        lastName: rstring(8),
        birthDate: rdate(),
		deviceToken: "abc"
    },(bdy) => {
		const uid = bdy._id;

		putRequest("/api1/healthstate", {
			_user: uid,
			isSick: rbool(),
			smileyRating: Math.floor(rnd(1, 5)),
			hasHeadache: rbool(),
			hasSoreThroat: rbool(),
			hasCoughing: rbool(),
			hasFever: rbool(),
			hasRunningNose: rbool(),
			hasLimbPain: rbool(),
			lat: rlat(),
			lng: rlng()
		},(bdy) => {
			for(var j=0;j<argv.l;j++) {
				putRequest("/api1/location/report", {
					_user: uid,
					lat: rlat(),
					lng: rlng()
				});
			}
		});
    });

}

for(var i=0;i<argv.u;i++) {
    run();
}
