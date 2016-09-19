'use strict';
var start = process.hrtime();
var astart = process.hrtime();
var _m = {};
var _req;

module.exports = {
    elapsed: function(name) {
        var precision = 3; // 3 decimal places
        var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
        var s = elapsed.toFixed(precision) + "ms";

        var aelapsed = process.hrtime(astart)[1] / 1000000; // divide by a million to get nano to milli
        var as = aelapsed.toFixed(precision) + "ms total";
        //console.log(name, s, as);
        start = process.hrtime(); // reset the timer
        _m[name] = [s,as];
        return s;
    },
    start:function(req) {
        if(!req.timing) {
            astart = process.hrtime();
            start = process.hrtime();
            _m = {};
            _req = req;
            req.timing = _m;
        }

    },
    get:function() {
        return _m;
    }
};