// Bind and Events dependencies
var Bind = require("github/jillix/bind")
  , Events = require("github/jillix/events")
  ;

/**
 *  Mono module for jxMaps application
 */
module.exports = function(config) {

    // get module
    var self = this;

    // call events
    Events.call(self, config);

    // binds
    config.binds = config.binds || [];
    config.options = Object (config.options);

    // run the binds
    for (var i = 0; i < config.binds.length; ++i) {
        Bind.call(self, config.binds[i]);
    }

    // set config in self
    self.config = config;
    self._maps = {};

    // crud operations
    var operations = ["create", "read", "update", "delete"];

    // generate client methods
    for (var i = 0; i < operations.length; ++i) {
        (function (op) {
            self[op] = function (options, callback) {
                self.link (op, { data: options }, callback);
            };
        })(operations[i]);
    }

    /**
     *  mono-maps#embed
     *  Gets the map to embed from database
     *
     *  Arguments
     *    options: an object containing:
     *      - mapId: the map id
     *    callback: the callback function
     * */
    self.embed = function (options, callback) {

        // default value for callback
        callback = callback || function () {};

        // call server operation
        self.link ("embed", { data: options}, function (err, mapData) {

            // handle error
            if (err) {
                return callback (err);
            }

            // cache map in _maps
            self._maps[mapData._id] = mapData;

            // get google maps script
            $.getScript("https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=__initializeMap");
        });
    }

    /**
     *  This is a global function that will be called after loading the
     *  Google library.
     *
     * */
    window.__initializeMap = function (mapData) {

        // no map data
        if (!mapData) {
            for (var mapId in self._maps) {
                __initializeMap (self._maps[mapId]);
            }
            return;
        }

        // get map element
        var mapEl = $(self.config.options.map)[0];
        if (!mapEl) {
            console.error ("No map element found.");
        }

        // map options
        var mapOptions = {
            center: new google.maps.LatLng (
                mapData.options.center.lat
              , mapData.options.center.lng
            )
          , zoom: mapData.options.zoom
          , mapTypeId: google.maps.MapTypeId[mapData.options.type]
        };

        // save google maps instance in _gmap
        self._gmap = new google.maps.Map(mapEl, mapOptions)
    };

    // emit ready
    self.emit("ready", self);
};
