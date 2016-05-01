var express = require('express'),
    router = express.Router();


router.get('/', function (req, res) {
    res.send('Hello.');
});

router.use('/api/+'+global.API_VERSION+'/heatmap', require('./heatmap'));


module.exports = router;