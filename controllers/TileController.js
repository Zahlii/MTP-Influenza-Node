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

const PERC = 20.0/SIZE;
const PERC_MIN = 1-PERC;
const PERC_MAX = 1+PERC;


const merc = new SphericalMercator({
    size: SIZE
});

module.exports.renderTile = (req,res,next) => {
    var d = new Date(),
        x = req.params.x,
        z = req.params.z,
        y = req.params["y.png"].match(/\d+/)[0];

    var i = getTileInfo(x,y,z),
        cb = (path) => {
            var img = fs.readFileSync(path);

            res.writeHead(200, {'Content-Type': 'image/png','Cache-Control': 'max-age=31556926' });
            res.end(img, 'binary');

            return next();
        };

    if(!i.exists) {
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
    // [ -168.75, 70.61261423801925, -157.5, 74.01954331150228 ] sw,ne

    var q = [[bbox[2]*PERC_MIN,bbox[3]*PERC_MIN],
        [bbox[0]*PERC_MAX,bbox[1]*PERC_MAX]];

    //console.log(bbox,q);

    Location.find({
        geo: {
            $geoWithin: {
                $box: q
            }
        }
    },cb);



}
function renderTileInternal(x,y,z,path,cb) {


    var box = merc.bbox(x,y,z);

    getDataPoints(box,(err,data) => {
        var heat = heatmap(256,256, { radius : 30 });

        if(err) {
            //log.backgroundError("Failed loading heatmap tile data",err);
            path = base + '/tiles/clear.png';
        } else {
            for (var i = 0, l = data.length; i < l; i++) {
                var d = data[i];
                var cx = getLocationCoordinates(x, y, z, d.geo.coordinates[1],d.geo.coordinates[0]);
                heat.addPoint(cx.x, cx.y, { weight:d.healthScore/100.0});
                //console.log(cx);
            }

            heat.draw();

            fs.writeFileSync(path, heat.canvas.toBuffer());

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
