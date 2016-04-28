var express = require('express'),
    router = express.Router();

router.get('/:lat/:lng', function (req, res) {
    res.send('LatLng ' + req.params.lat + ', '+req.params.lng);
});


module.exports = router;