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
    config.options.ui = Object (config.options.ui);

    // run the binds
    for (var i = 0; i < config.binds.length; ++i) {
        Bind.call(self, config.binds[i]);
    }

    // set config in self
    self.config = config;
    self._maps = {};

    // ui
    self._$ = {
        map: $(self.config.options.ui.map)
      , waiter: $(self.config.options.ui.map)
      , error: $(self.config.options.ui.map)
    }

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

        // update ui
        self._$.map.hide();
        self._$.waiter.show();

        // default value for callback
        callback = callback || function () {};

        // call server operation
        self.link ("embed", { data: options}, function (err, mapData) {

            // handle error
            if (err) {

                // update UI
                self._$.waiter.fadeOut();
                self._$.error.fadeIn().text(err);

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
        var mapEl = self._$.map[0];
        if (!mapEl) {
            return console.error ("No map element found.");
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

        // default value for markers
        var markers = mapData.markers = mapData.markers || []
          , allMarkers = []
          ;

        // each marker
        for (var i = 0; i < markers.length; ++i) {

            (function (cMarker) {

                // icon exists
                if (cMarker.icon) {

                    cMarker.icon = new google.maps.MarkerImage(
                        cMarker.icon.path
                      , new google.maps.Size (
                            cMarker.icon.size.w
                          , cMarker.icon.size.h
                        )
                      , new google.maps.Point (
                            cMarker.icon.origin.x
                          , cMarker.icon.origin.y
                        )
                      , new google.maps.Point (
                            cMarker.icon.anchor.x
                          , cMarker.icon.anchor.y
                        )
                    );
                }

                // create google marker
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(cMarker.position.lat, cMarker.position.lng)
                  , map: self._gmap
                  , title: cMarker.title || ""
                  , icon: cMarker.icon || undefined
                  , visible: cMarker.visible
                });

                // infowin exists
                if (cMarker.infowin) {
                    cMarker.infowin = new google.maps.InfoWindow({
                        content: cMarker.infowin.content
                    });
                }

                // push the new marker
                allMarkers.push (marker);

                // add click event for info window
                google.maps.event.addListener(marker, "click", function() {
                    if (!cMarker.infowin) return;
                    cMarker.infowin.open(self._gmap, marker);
                });
            })(markers[i]);
        }

        // marker clusterer
        self._gmarkerClusterer = new MarkerClusterer(self._gmap);

        // update ui
        self._$.map.fadeIn();
        self._$.waiter.fadeOut();
    };

    // we are on the embed page
    if (
        location.pathname + location.search + location.hash === self.config.options.embedPage
        && self.config.options.automaticallyEmbed !== false
    ) {

        // get the map id
        var mapId = Utils.queryString ("mapId");

        // no map id
        if (!mapId) {
            self._$.map.hide();
            self._$.waiter.hide();
            self._$.error.text("Missing mapId.");
        }

        // call embed method
        self.embed ({mapId: mapId});
    }

    // emit ready
    self.emit("ready", self);
};
