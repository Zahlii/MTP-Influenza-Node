'use strict';
const log = require('../util/log.js');
const fs = require('fs');
const path = require('path');
const base = path.resolve('./');
const heatmap = require('../util/heatmap');
const SphericalMercator = require('sphericalmercator');
const SIZE = 256;
const mongoose = require('mongoose');
const Location = mongoose.model('Location');
const timing = require('../util/timing.js');

const PERC = 30.0/SIZE;



const merc = new SphericalMercator({
    size: SIZE
});

module.exports.renderTile = (req,res,next) => {
    timing.start(req);
    var d = new Date(),
        x = req.params.x,
        z = req.params.z,
        y = req.params["y.png"].match(/\d+/)[0];

    var i = getTileInfo(x,y,z),
        cb = (path) => {
            timing.elapsed('Sending file to client');
            var img = fs.createReadStream(path);

            //res.writeHead(200, {'Content-Type': 'image/png','Cache-Control': 'max-age=31556926' });
            res.statusCode = 200;
            img.pipe(res);
            timing.elapsed('Sent file to client');
            return next();
        };

    if(!i.exists) {
        timing.elapsed('Not existing, rendering...');
        renderTileInternal(x,y,z,i.path, cb);
    } else {
        cb(i.path);
    }

};

function getLocationCoordinates(x,y,z,lat,lng) {
    var g = merc.px([lng,lat],z);


    g[0] -= x*SIZE;
    g[1] -= y*SIZE;

    return {
        x:g[0],
        y:g[1]
    }
}

function getDataPoints(bbox,cb) {
    // [ 8.4375, 49.15296965617039, 8.7890625, 49.38237278700955 ] sw, ne


    // Add size to the box so that edges render correctly
    var outlet = Math.abs(bbox[2]-bbox[0])*PERC;
    bbox = [bbox[0]-outlet,bbox[1]-outlet,bbox[2]+outlet,bbox[3]+outlet];


    var s = [[[bbox[0],bbox[1]],[bbox[0],bbox[3]],[bbox[2],bbox[3]],[bbox[2],bbox[1]],[bbox[0],bbox[1]]]];
    //console.log(s);


    // use 2DSphere
    // {geo: { $geoWithin: { $geometry: { type:"Polygon", coordinates: [[[8,49],[8,50],[9,50],[9,49],[8,49]]] } } } }
    // sw, nw, ne, se, sw
    Location.find({
        geo: {
            $geoWithin: {
                $geometry: {
                    type:"Polygon",
                    coordinates: s
                }
            }
        }
    },cb);



}
function renderTileInternal(x,y,z,path,cb) {


    var box = merc.bbox(x,y,z);

    getDataPoints(box,(err,data) => {
        timing.elapsed('Got required data points');


        if(err) {
            //log.backgroundError("Failed loading heatmap tile data",err);
            path = base + '/tiles/clear.png';
        } else {
            //console.log('Size: '+data.length);

            var l = data.length;
            if (l == 0) {
                var clear = base + '/tiles/clear.png';
                var inStr = fs.createReadStream(clear);
                var outStr = fs.createWriteStream(path);

                inStr.pipe(outStr);
            } else {
                var heat = heatmap(256, 256, {radius: 30});
                for (var i = 0; i < l; i++) {
                    var d = data[i];
                    var cx = getLocationCoordinates(x, y, z, d.geo.coordinates[1], d.geo.coordinates[0]);
                    heat.addPoint(cx.x, cx.y, {weight: d.healthScore / 100.0});
                    //console.log(cx);
                }

                heat.draw();

                fs.writeFileSync(path, heat.canvas.toBuffer());
            }

        }

        if(cb)
            cb(path);
    });


}

function getTileInfo(x,y,z) {
    var dir =  '/tiles/' + z + '/' + x + '/',
        img = base + dir + '/' + y + '.png';


    if(fs.existsSync(img)) {
        return {
            exists: 1,
            path : img
        };
    } else {
        var parts = dir.split('/');
        var pre = '';
        for(var i=0;i<parts.length-1;i++) {
            pre = pre  + '/' + parts[i];
            var current = base + pre + '/';
            if(fs.existsSync(current))
                continue;

            fs.mkdir(current);
        }

        return {
            exists: 0,
            path: img
        };
    }
}
