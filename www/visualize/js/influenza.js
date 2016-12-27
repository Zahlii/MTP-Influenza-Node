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
                    xaxis: {
                        mode: "time",
                        timeformat: "%d.%m.%Y",
                        tickSize: [1, "day"],
                    },
                    bars: {
                        align: "center"
                    }
                };
                $.plot($('#flot_timeline'),dataset,options);
            }
        });

    }

    loadTimeline();

})(window.jQuery);