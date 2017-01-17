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

client.stream('statuses/filter', {locations:'-180,-90,180,90'}, function(stream) {
    stream.on('data', function(event) {
        if(event.text) {
            var lng = 0, lat = 0, pos = null, accuracy = -1;
            //console.log(event);

            if(event.place) {
                var corners = event.place.bounding_box.coordinates[0];

                pos = 'place';

                var d1 = new GeoPoint(corners[0][1],corners[0][0]);
                var d2 =  new GeoPoint(corners[2][1],corners[2][0]);
                accuracy = d1.distanceTo(d2,true)/2;

                lng = (corners[0][0]+corners[2][0])/2;
                lat = (corners[0][1]+corners[1][1])/2;
            } else {
                pos = 'geo';
                accuracy = 0;
                lng = event.geo.coordinates[0];
                lat = event.geo.coordinates[1];
            }

            var data = {position: pos, lat:lat,lng:lng,accuracy: accuracy, text:event.text};
            //console.log(data);

            var regex = new RegExp('(\\b' + search.join('\\b|\\b')+'\\b)','i');
            if(event.text.match(regex)) {
                console.log(data);
            }
        }
    });

    stream.on('error', function(error) {
        throw error;
    });
});


