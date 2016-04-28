var express = require('express'),
    router = express.Router();


router.get('/', function (req, res) {
    res.send('Hello.');
});

router.use('/heatmap', require('./heatmap'));


module.exports = router;