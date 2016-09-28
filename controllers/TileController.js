'use strict';
const log = require('../util/log.js');
const fs = require('fs');
const path = require('path');
const base = path.resolve('./tiles');
const heatmap = require('../util/heatmap');

module.exports.renderTile = (req,res,next) => {
    var d = new Date(),
        x = req.params.x,
        z = req.params.z,
        y = req.params["y.png"].match(/\d+/)[0];

    var i = getTileInfo(x,y,z);

    if(!i.exists) {
        renderTileInternal(x,y,z,i.path);
    }
    var img = fs.readFileSync(i.path);
    res.writeHead(200, {'Content-Type': 'image/png' });
    res.end(img, 'binary');

    return next();
};


function renderTileInternal(x,y,z,path) {
    //fs.touch
}

function getTileInfo(x,y,z) {
    var dir =  z + '/' + x + '/',
        img = base + '/' + dir + '/' + y + '.png';


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
