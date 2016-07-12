'use strict';

module.exports = {
    calculateAge:(birthDate, today) => {
        if(typeof today === 'undefined')
            today = new Date();

        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    },
    calculateHealthScore:(data) => {
        var w = {
            isSick:0.3,
            hasHeadache:0.4,
            hasRunningNose:0.2,
            hasSoreThroat:0.3,
            hasLimbPain:0.8,
            hasFever:0.6,
            hasCoughing:0.4
        };

        var sum = 0,
            sumW = 0;
        for(var p in w) {
            if(w.hasOwnProperty(p)) {
                data[p] = data[p] === 'true';
                var c = w[p];
                sumW += c;
                sum += data[p] ? c : 0;
            }
        }

        return (sum/sumW)*100
    }
};
