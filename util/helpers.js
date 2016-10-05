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
        //.log('Hallo');
        //console.log(data);
		// smiley 1-5 (1 = richtig scheisse, 5 = perfekt)
		// symptome sind 0/1 (ja nein)
		// healthscore ist 0 - 100 (gesund bis komplett krank)
        var w = {
            isSick:0.2,
            hasHeadache:0.4,
            hasRunningNose:0.2,
            hasSoreThroat:0.3,
            hasLimbPain:0.8,
            hasFever:0.6,
            hasCoughing:0.4
        };

        //console.log(data);

		// berechnet den healthscore von 0-100 ausgehend nur von den symptomen
        var sum = 0.0,
            sumW = 0.0;
        for(var p in w) {
            if(w.hasOwnProperty(p)) {
                data[p] = (data[p] === true || data[p] === 'true' || data[p] === 'True' || data[p] === 1);
                var c = w[p];
                sumW += c;
                sum += data[p] ? c : 0.0;
            }
        }

		// healthscore anhand der symptome alleine
        var sympt = (sum/sumW)*100.0;


		// berechne den multiplikator ausgehend von den smileys
		var mult = (1-(data.smileyRating-1)/5.0);
		// smiley = 1 -> mult = 1
		// smiley = 5 -> mult = 1-4/5 = 0.2
        //console.log(sympt,mult);
		return mult*sympt;

    }
};
