'use strict';

const API_ENDPOINT = 'https://wifo1-30.bwl.uni-mannheim.de/api1/kpi/';

(function($) {


    function loadTimeline() {
        $.ajax({
            url: API_ENDPOINT + 'timeline',
            type: 'PUT',
            data: 'latSW=48&lngSW=7&latNE=51&lngNE=10',
            success: function(data) {
                var data_new = [],
                    data_total = [];

                for(var i=0,l=data.length;i<l;i++) {
                    var currentDay = data[i],
                        d = new Date(currentDay._id);

                    data_new.push([d.getTime(),currentDay.countNew]);
                    data_total.push([d.getTime(),currentDay.countAll]);
                }


                var dataset = [
                    { label: "New Infections", data: data_new, color: "#900" },
                    { label: "Total Infections", data: data_total, color: "#090"}
                ];

                var options = {
                    data: [[0,1],[20,5]],
                    series: {
                        lines: {
                            show: true
                        }
                    },
                    grid: {
                        margin:5,
                        color:"#CCC",
                        borderWidth:1
                    },
                    xaxis: {
                        mode: "time",
                        timeformat: "%d.%m.%Y",
                        tickSize: [1, "day"],
                    },
                };
                $.plot($('#flot_timeline'),dataset,options);
            }
        });

    }

    loadTimeline();

})(window.jQuery);

var map;

function _(n) {
    return n < 10 ? '0'+n : n;
}
function loadOverlay() {
    var imageMapType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            var d = new Date("2016-11-18"),
                year = d.getUTCFullYear(),
                month = _(d.getUTCMonth()+1),
                day = _(d.getUTCDate()),
                hour = d.getUTCHours(),
                hour = _(hour - hour % 6);

            if (zoom < 8 || zoom > 15) {
                return null;
            }

            return ['https://wifo1-30.bwl.uni-mannheim.de/api1/tiles',
                    year,month,day,hour,zoom, coord.x, coord.y].join('/')+'.png';
        },
        tileSize: new google.maps.Size(256, 256),
        opacity:0.8,
        name: "Influenza Heatmap"
    });

    map.overlayMapTypes.clear();
    map.overlayMapTypes.push(imageMapType);
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 49.5, lng: 8.5},
        maxZoom: 15,
        minZoom: 8
    });

    loadOverlay();
}