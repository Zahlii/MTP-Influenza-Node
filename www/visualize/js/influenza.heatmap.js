'use strict';

function InfluenzaMap(node) {
    const STEP = 6*60*60; // 6 hour intervals
    function _(n) {
        return n < 10 ? '0' + n : ''+n;
    }
    function _roundDate(d) {
        var year = d.getUTCFullYear(),
            month = d.getUTCMonth(),
            day = d.getUTCDate(),
            hour = d.getUTCHours();

        hour = hour - hour % 6;

        return new Date(year,month,day,hour,0,0);
    }
    function _adjustDate(d,difference) {
        var nd = new Date(d.getTime()+difference);

        if(nd.getTime() > (new Date()).getTime())
            return _roundDate((new Date()));

        return nd;
    }

    function _executeListeners(event,data) {
        $.each(_listeners[event],(index,element) => {
            element.call(this,data);
        })
    }

    var _currentDate = _roundDate(new Date()),
        _lastCurrentDate = null,
        _currentBounds = null,
        _listeners = {
            'bounds_changed': [],
            'time_changed': []
        },
        _isPlaying = false,
        _playbackTimer;

    var _map = new google.maps.Map(node, {
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        center: {lat: 49.5, lng: 8.5},
        maxZoom: 15,
        minZoom: 8,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
    });
    _map.overlayMapTypes.push(null); //placeholder
    var _node = node;

    google.maps.event.addListener(_map, 'bounds_changed', (function () {
        var timer; // we only want to execute the callback every 0.5seconds max, happens when zooming
        return function() {
            clearTimeout(timer);
            timer = setTimeout(function() {
                var bounds =  _map.getBounds(),
                    b = {
                        ne:{
                            lat:bounds.getNorthEast().lat(),
                            lng:bounds.getNorthEast().lng()
                        },
                        sw:{
                            lat:bounds.getSouthWest().lat(),
                            lng:bounds.getSouthWest().lng()
                        },
                    };

                _currentBounds = b;
                _executeListeners('bounds_changed',b);
            }, 500);
        }
    }()));

    this.nextStep = () => {
        _currentDate = _adjustDate(_currentDate,STEP*1000);
        this.reloadOverlay();
    };

    this.toNow = () => {
        this.setCurrentDate(new Date());
    };

    this.previousStep = () => {
        _currentDate = _adjustDate(_currentDate,-STEP*1000);
        this.reloadOverlay();
    };

    this.setCurrentDate = (d) => {
        _currentDate = _roundDate(d);
        this.reloadOverlay();
    };

    this.getCurrentDate = () => {
        return _currentDate;
    };


    this.getMapBounds = () => {
        return _currentBounds;
    };

    this.on = (event, fn) => {
        if(!_listeners[event])
            throw "Invalid event "+event;

        _listeners[event].push(fn);
    };

    this.play = () => {
        if(_isPlaying)
            return;

        _isPlaying = true;
        _playbackTimer = window.setInterval(this.nextStep,1000);
    };

    this.pause = () => {
        if(!_isPlaying)
            return;
        window.clearInterval(_playbackTimer);
        _isPlaying = false;
    };

    this.reloadOverlay = () => {

        // prevent loading again when nothing happened
        if(_lastCurrentDate && _currentDate.getTime() == _lastCurrentDate.getTime())
            return;

        _lastCurrentDate = _currentDate;

        console.log('Showing HeatMap for ' + _currentDate);
        _executeListeners('time_changed',_currentDate);

        var imageMapType = new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                var d = _currentDate,
                    year = d.getUTCFullYear(),
                    month = _(d.getUTCMonth()+1),
                    day = _(d.getUTCDate()),
                    hour = d.getUTCHours();

                hour = _(hour - hour % 6);

                if (zoom < 8 || zoom > 15) {
                    return null;
                }

                var tile = [TILE_ENDPOINT,year,month,day,hour,zoom, coord.x, coord.y].join('/')+'.png';
                return tile;
            },
            tileSize: new google.maps.Size(256, 256),
            opacity:0.8,
            name: "Influenza Heatmap",
            maxZoom:15,
            minZoom:8
        });

        _map.overlayMapTypes.setAt(0,imageMapType);
    };


}

