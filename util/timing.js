'use strict';
var start = process.hrtime();
var _m = {};

module.exports = {
    elapsed: function(name) {
        var precision = 3; // 3 decimal places
        var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
        var s = elapsed.toFixed(precision) + " ms - " + name;
        start = process.hrtime(); // reset the timer
        m[name] = s;
        return s;
    },
    start:function() {
        start = process.hrtime();
        _m = {};
    },
    get:function() {
        return _m;
    }
};