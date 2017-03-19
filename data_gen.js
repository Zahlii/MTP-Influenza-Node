"use strict";

require('pmx').init({
    http : true
});

const http = require('request');
const os = require('os');
const monogooseInitiator = require('./model/index.js');
monogooseInitiator.initMongoose();

const mongoose = require('mongoose');
const User = mongoose.model('User');

const base = os.hostname() == "wifo1-30" ? "https://wifo1-30.bwl.uni-mannheim.de:8082" : "http://localhost:8082";

var ID = 1;

const DEL = ';';

function putRequest(url, data,cb) {
    url = base + url;

    //var t = Date.now();

    console.log(data);

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

function r_uid(needsHR, cb) {
    var pipe = [];

    if(needsHR)
        pipe.push({ $match:{ lastHealthReport: { $ne: null }}});

    pipe.push({$sample: { size: 1 } });
    pipe.push({$project: { _id:1}});

    User.aggregate(pipe).exec(cb);
}

function rnd_healthstate(uid,cb) {
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
    },cb);
}

function rnd_location(uid,cb) {
    putRequest("/api1/location/report", {
        _user: uid,
        lat: rlat(),
        lng: rlng()
    },cb);
}

fn_state();
fn_loc();

function fn_state() {
    r_uid(false,(err,doc) => {
        rnd_healthstate(doc[0]._id,() => {
            var t = rnd(1*60*1000,6*60*1000);
            console.log('Waiting '+t/60000);
            setTimeout(fn_state,t);
        });
    });
}
function fn_loc() {
    r_uid(true,(err,doc) => {
        rnd_location(doc[0]._id,() => {
            var t = rnd(0.5*60*1000,3*60*1000);
            console.log('Waiting '+t/60000);
            setTimeout(fn_loc,t);
        });
    });
}

