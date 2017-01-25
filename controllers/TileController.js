'use strict';
const log = require('../util/log.js');
const fs = require('fs');
const path = require('path');
const base = path.resolve('./');
const heatmap = require('../util/heatmap');
const SphericalMercator = require('sphericalmercator');
const SIZE = 256;
const config = require('config');
const mongoose = require('mongoose');
const Location = mongoose.model('Location');
const timing = require('../util/timing.js');

const PERC = 30.0/SIZE;



const merc = new SphericalMercator({
    size: SIZE
});

module.exports.renderTile = (req,res,next) => {
    timing.start(req);
    var year = req.params.year,
        month = req.params.month,
        day = req.params.day,
        hour = req.params.hour,
        hour = hour - hour % 6,
        dateEnd = new Date(year + '-' + month + '-' + day + ' ' + hour +':00:00'),
        dateStart = new Date(dateEnd.getTime() - 86400*1000),
        x = req.params.x,
        z = req.params.z,
        y = req.params["y.png"].match(/\d+/)[0];

	if(dateEnd.getTime() > Date.now() || z > 15) {
		var path = base + '/tiles/clear.png';
		var inStr = fs.createReadStream(path);

		inStr.pipe(res);
	} else {
		var i = getTileInfo(year,month,day,hour,x,y,z);

		if(!i.exists) {
			timing.elapsed('Not existing, rendering...');
			renderTileInternal(dateStart,dateEnd,x,y,z,i.path, () => {
				timing.elapsed('Sent rendered file to client');
			},res);
		} else {
			timing.elapsed('Sending file to client');
			var img = fs.createReadStream(i.path);

			res.set({'Content-Type': 'image/png','Cache-Control': 'max-age=31556926' });
			res.statusCode = 200;
			img.pipe(res);
			timing.elapsed('Sent file to client');
			return next();
		}
	}

};

function getLocationCoordinates(x,y,z,lat,lng,id) {
    // generate jitter factor based on the object ID so that one heatmap point has the same position on all zooms
    var intval = parseInt(id,16);
    var length = id.length;
    var max = Math.pow(16,length);

    var normalized = intval/max; // [0,1]
    normalized = normalized % 0.05; // [0,0.05]
    normalized = normalized / 250; // [0,0.0002]

    lat = lat*(1.0001-normalized); // add jitter
    lng = lng*(1.0001-normalized);

    var g = merc.px([lng,lat],z);


    g[0] -= x*SIZE;
    g[1] -= y*SIZE;

    return {
        x:g[0],
        y:g[1]
    }
}

function getDataPoints(dateStart,dateEnd,bbox,cb) {
    // [ 8.4375, 49.15296965617039, 8.7890625, 49.38237278700955 ] sw, ne


    // Add size to the box so that edges render correctly
    var outlet = Math.abs(bbox[2]-bbox[0])*PERC;
    bbox = [bbox[0]-outlet,bbox[1]-outlet,bbox[2]+outlet,bbox[3]+outlet];


    var s = [[[bbox[0],bbox[1]],[bbox[0],bbox[3]],[bbox[2],bbox[3]],[bbox[2],bbox[1]],[bbox[0],bbox[1]]]];
    //console.log(s);


    // use 2DSphere
    // {geo: { $geoWithin: { $geometry: { type:"Polygon", coordinates: [[[8,49],[8,50],[9,50],[9,49],[8,49]]] } } } }
    // sw, nw, ne, se, sw
    Location.aggregate([{
        $match: {
            healthScore: {
                $gte: config.calc.infectionHealthScoreThreshold  // above threshold
            },
            timestamp: {
                $gte: dateStart,
                $lte: dateEnd
            }
        }
    }, {
        $sort: {
            timestamp: -1 // DESC
        }
    }, {
        $group: {
            _id: "$_user", // $_user nachher
            geo: {
                $first: "$geo" // newest location
            },
            healthScore: {
                $first: "$healthScore" // newest healthscore in the time
            }
        }
    }, {
        $match: { //and now we match relevant points, other way around the heatmap gets glitched
            geo: {
                $geoWithin: {
                    $geometry: {
                        type:"Polygon",
                        coordinates: s
                    }
                }
            }
        }
    }],cb);
    /*
    Location.aggregate([{
            $match: {
                geo: {
                    $geoWithin: {
                        $geometry: {
                            type:"Polygon",
                            coordinates: s
                        }
                    }
                },
                healthScore: {
                    $gte: config.calc.infectionHealthScoreThreshold  // above threshold
                },
                timestamp: {
                    $gte: dateStart,
                    $lte: dateEnd
                }
            }
        }, {
            $sort: {
                timestamp: -1 // DESC
            }
        }, {
            $group: {
                _id: "$_user", // $_user nachher
                geo: {
                    $first: "$geo" // newest location
                },
                healthScore: {
                    $avg: "$healthScore" // average healthscore in the time
                }
            }
        }],
        cb
    );*/

/*.find({
        timestamp: {
            $gte:dateStart,
            $lte:dateEnd
        },
        geo: {
            $geoWithin: {
                $geometry: {
                    type:"Polygon",
                    coordinates: s
                }
            }
        }
    },cb);*/



}

function renderTileInternal(dateStart,dateEnd,x,y,z,path,cb,res) {


    var box = merc.bbox(x,y,z);


	getDataPoints(dateStart,dateEnd,box,(err,data) => {
		timing.elapsed('Got required data points');


		if(err) {
			//console.log(err);
			//log.backgroundError("Failed loading heatmap tile data",err);
			path = base + '/tiles/clear.png';
		} else {
			//console.log('Size: '+data.length);

			var l = data.length;
			//console.log(l);
			if (l == 0) {
				var clear = base + '/tiles/clear.png';
				var inStr = fs.createReadStream(clear);
				var outStr = fs.createWriteStream(path);

				inStr.pipe(res);
				inStr.pipe(outStr);
			} else {
				var heat = heatmap(256, 256, {radius: 20});
				for (var i = 0; i < l; i++) {
					var d = data[i];

					var fact = 1;//Math.pow(2,(15-z)/2);
					var cx = getLocationCoordinates(x, y, z, d.geo.coordinates[1], d.geo.coordinates[0], d._id+"");

					heat.addPoint(cx.x, cx.y, {weight: d.healthScore / 100.0 / fact});
					//console.log(cx);
				}

				timing.elapsed('Starting to draw');
				heat.draw();
				timing.elapsed('Streaming data');
				var source = heat.canvas.createPNGStream();
				var file = fs.createWriteStream(path);

				source.pipe(res);
				source.pipe(file);
			}

		}

		if(cb)
			cb();
	});
	


}

function getTileInfo(year,month,day,hour,x,y,z) {
    var dir =  ['/tiles',year,month,day,hour,z,x].join('/'),
        img = base + dir + '/' + y + '.png';

    //console.log(dir,img,base);


    if(fs.existsSync(img)) {
        return {
            exists: 1,
            path : img
        };
    } else {
        var parts = dir.split('/');
        //console.log(parts);
        var pre = '';
        for(var i=1;i<parts.length;i++) {
            pre = pre  + '/' + parts[i];
            var current = base + pre + '/';
            if(fs.existsSync(current))
                continue;

            try {
                fs.mkdir(current,(err) => {
                    // console.log(err);
                });
            } catch(e) {
                var z = 0;
                //console.log(e);
            }
        }

        return {
            exists: 0,
            path: img
        };
    }
}
