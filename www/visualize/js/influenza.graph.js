'use strict';

function InfluenzaDashboardGraph(node) {
    var _node = node,
        _options = {
            series: {
                bars: {
                    show: true,
                    barWidth:24*60*60*1000,
                    align:"center",
                    numbers:{
                        show:true
                    }
                }
            },
            grid: {
                margin:5,
                color:"#CCC",
                borderWidth:1,
                hoverable:true
            },
            xaxis: {
                mode: "time",
                timeformat: "%d.%m<br />%Y",
                //tickSize: [1, "day"],
            }
        },
        _bounds = null;

    function _loadData(d) {
        $.ajax({
            url: API_ENDPOINT + '/timeline',
            type: 'PUT',
            data: d,
            success: function(data) {
                var data_new = [[new Date().getTime(),null]],
                    data_total = [[new Date().getTime(),null]],
                    l=data.length;

                for(var i=0;i<l;i++) {
                    var currentDay = data[i],
                        d = new Date(currentDay._id);

                    data_new.push([d.getTime(),currentDay.countNew]);
                    data_total.push([d.getTime(),currentDay.countAll]);
                }


                var dataset = [
                    { label: "New Infections", data: data_new, color: "rgba(200,0,0,0.8)"},
                    { label: "Total Infections", data: data_total, color: "rgba(200,100,0,0.8)"}
                ];


                $.plot($(_node),dataset,_options);
            }
        });
    }

    this.loadForBounds = (bounds) => {

        var _s = 'latSW='+bounds.sw.lat+'&lngSW='+bounds.sw.lng+'&latNE='+bounds.ne.lat+'&lngNE='+bounds.ne.lng;

        console.log('Loading Timeline Graph for bounds ' + _s);
        // 'latSW=48&lngSW=7&latNE=51&lngNE=10'
        _loadData(_s);
    }
}

new InfluenzaDashboardGraph($('#flot_timeline'));