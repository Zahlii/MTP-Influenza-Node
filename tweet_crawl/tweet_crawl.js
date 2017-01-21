'use strict';

const Twitter = require('twitter');
const GeoPoint = require('geopoint');

// https://dev.twitter.com/oauth/application-only

var client = new Twitter({
    consumer_key: 'hz268hst84Nr44ut23LIvYPyP',
    consumer_secret: 'h9GRvyzO3jigt3ZCwWQf6oFud1SNxCNki61j4UMrdWRjw6Zm95',
    //bearer_token: 'AAAAAAAAAAAAAAAAAAAAAJMsywAAAAAAS8aM0XuOchsdDg0bNM6IAM1mE4A%3Ddu2l09mZQeGuLogV7YZmalvW7qBaFQcHdcVcRcK5q1OKPoRprg',
    access_token_key: '77675048-35T52lAqK0SgRj2LW6QOx1FpCD4KOKp6KBienBOnf',
    access_token_secret: 'maFy3XfnURZt3bWOQjRHbdQ0B2c2c6gdMN3G2Ryaak0t6'
});

//const search = '#flu OR #influenza OR #grippe OR #sick OR #fever';
//const searchEncoded = encodeURIComponent(search);

const search = 'flu|influenza|grippe|sick|fever|coughing|cold|fieber|erkältung|husten|krank'.split('|');


var i = 1;

client.stream('statuses/filter', {locations:'-180,-90,180,90'}, function(stream) {
    stream.on('data', function(event) {
        if(event.text) {
            var lng = 0, lat = 0, pos = null, accuracy = -1;
            //console.log(event);

 

            if(event.place) {
                var corners = event.place.bounding_box.coordinates[0];


                var lngMin = Math.min(corners[0][0],corners[1][0],corners[2][0],corners[3][0]);
                var lngMax = Math.max(corners[0][0],corners[1][0],corners[2][0],corners[3][0]);

                var latMin = Math.min(corners[0][1],corners[1][1],corners[2][1],corners[3][1]);
                var latMax = Math.max(corners[0][1],corners[1][1],corners[2][1],corners[3][1]);

                var ne = new GeoPoint(latMin,lngMax);
                var sw = new GeoPoint(latMax,lngMin);

                pos = 'place';

                accuracy = ne.distanceTo(sw,true)/2;

                lng = lngMin + Math.random() * (lngMax - lngMin);
                lat = latMin + Math.random() * (latMax - latMin);

            } else {
                pos = 'geo';
                accuracy = 0;
                lng = event.geo.coordinates[0];
                lat = event.geo.coordinates[1];
            }

            var data = {
				//number:i++,
                position: pos,
                lat:lat,
                lng:lng,
                accuracy: accuracy,
                text:event.text,
                time: (new Date()),
                userId: event.user.id,
                userName: event.user.screen_name,
                tags: event.entities.hashtags,
                symbols: event.entities.symbols,
				mentions: event.entities.user_mentions,
                language: event.user.lang
            };

			

            var regex = new RegExp('(\\b' + search.join('\\b|\\b')+'\\b)','i');
			
			//console.log(i++);
			
            if(event.text.match(regex)) {
                console.log(JSON.stringify(data)+",");
            }
        }
    });

    stream.on('error', function(error) {
        throw error;
    });
});


