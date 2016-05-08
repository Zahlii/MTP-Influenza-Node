'use strict';
module.exports.displayHeatmapData = (lat, lng, ts, res) => {
    if (lat > 90 || lat < -90) {
        res.send(400, {
                status: "Error",
                Error: "Invalid latitude specified."
            }
        );
    } else if (lng > 180 || lng < -180) {
        res.send(400, {
                status: "Error",
                message: "Invalid longitude specified."
            }
        );
    } else {
        require('../model/db').
            getHealthReportsAroundLocationAtDate(lat, lng, ts ? ts : new Date(), (err, rows, fields) => {
            if (err) {
                res.send(400, {
                    status: "Error",
                    message: err.message
                });
            } else {
                res.send(200, {
                    size: rows.length,
                    data: rows
                });
            }
        });
    }
}

