var express = require('express'),
    router = express.Router(),
    db = require('../model/db.js')

router.get('/now/:lat/:lng', function (req, res) {
    displayHeatmapData(req.params.lat,req.params.lng,new Date(),res);
});
router.get('/history/:ts/:lat/:lng', function (req, res) {
    displayHeatmapData(req.params.lat,req.params.lng,new Date(req.params.ts),res);
});

function displayHeatmapData(lat,lng,ts,res) {
    res.setHeader('Content-Type', 'application/json');

    if(lat>90 || lat<-90) {
        res.send(JSON.stringify({ status:"Error", message:"Invalid latitude specified." }));
    } else if (lng>180 || lng <-180) {
        res.send(JSON.stringify({ status:"Error", message:"Invalid longitude specified." }));
    } else {
        db.getHealthReportsAroundLocationAtDate(lat,lng,ts ? ts : new Date(),function(err, rows, fields) {
            if(err) {
                res.send(JSON.stringify({ status:"Error", message:err.message }));
            } else {
                res.send((JSON.stringify({ status:"Ok", size:rows.length,data:rows })));
            }
        });
    }
}

module.exports = router;