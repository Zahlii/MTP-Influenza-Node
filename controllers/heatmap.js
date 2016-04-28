var express = require('express'),
    router = express.Router();

router.get('/now/:lat/:lng', function (req, res) {
    res.send('LatLng ' + req.params.lat + ', '+req.params.lng);
});
router.get('/history/:ts/:lat/:lng', function (req, res) {
    var d = new Date(req.params.ts);
    res.send(d.toLocaleString() + ' - LatLng ' + req.params.lat + ', '+req.params.lng);
});


module.exports = router;