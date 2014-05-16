M.wrap('github/jillix/mono-maps/dev/client/main.js', function (require, module, exports) {

// dependencies
var Bind = require("github/jillix/bind")
  , Events = require("github/jillix/events")
  , Utils = require("github/jillix/utils")
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
      , waiter: $(self.config.options.ui.waiter)
      , error: $(self.config.options.ui.error)
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
     * embed
     * Gets the map to embed from database
     *
     * @param options: object containing
     *  - mapId: the map id
     * @param callback
     * @return
     */
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

            handleMapData (mapData);
        });
    }

    /**
     * handleMapData
     * This function attaches the map data to the module instance
     *
     * @param mapData
     * @return
     */
    function handleMapData (mapData) {

        // cache map data
        self._maps[mapData._id] = mapData;

        // get google maps script
        $.getScript("https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=__initializeMap");
    }

    /**
     * __initializeMap
     * This is a global function that will be called after
     * loading the Google library.
     *
     * @param mapData
     * @return
     */
    window.__initializeMap = function (mapData) {

        // handle ?address parameter
        if (self._maps._addressMap) {
            geocoder = new google.maps.Geocoder();
            return geocoder.geocode({
                address: Utils.queryString ("address")
            }, function(results, status) {
                var loc = results[0].geometry.location;
                if (!loc) { return console.error ("No location found"); }
                var lng = loc.A;
                var lat = loc.k;

                // set lng and lat values and delete address param
                Url.updateSearchParam("lng", lng);
                Url.updateSearchParam("lat", lat);
                Url.updateSearchParam("address");
                location.reload();
            });
        }

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

    // emit ready
    self.emit("ready", self);

    // we are on the embed page
    if (
        location.pathname + location.hash === self.config.options.embedPage
        && self.config.options.automaticallyEmbed !== false
    ) {

        // get the map id
        var mapId = Utils.queryString ("mapId")
          , lat = Utils.queryString ("lat")
          , lng = Utils.queryString ("lng")
          , address = Utils.queryString ("address")
          ;

        // map id was provided
        if (mapId) {
            return self.embed ({mapId: mapId});
        }

        if (address) {
            return handleMapData ({address: address, _id: "_addressMap" });
        }

        // querystring api
        if (lat && lng) {
            var mapData = {
                "name": Utils.queryString ("mapName") || "No name",
                "options": {
                    "center": {
                        "lat": Number(Utils.queryString ("centerLat")) || lat,
                        "lng": Number(Utils.queryString ("centerLng")) || lng
                    },
                    "zoom": Number(Utils.queryString ("zoom")),
                    "type": Utils.queryString ("zoom") || "ROADMAP"
                },
                "markers": [
                    {
                        "label": Utils.queryString ("markerLabel"),
                        "title": Utils.queryString ("markerTitle"),
                        "position": {
                            "lat": lat,
                            "lng": lng
                        },
                        "icon": {
                            "path": Utils.queryString ("iconPath"),
                            "label": Utils.queryString ("iconLabel"),
                            "size": {
                                "w": Number(Utils.queryString ("iconSizeW")),
                                "h": Number(Utils.queryString ("iconSizeH"))
                            },
                            "origin": {
                                "x": Number(Utils.queryString ("iconOriginX")),
                                "y": Number(Utils.queryString ("iconOriginY"))
                            },
                            "anchor": {
                                "x": Number(Utils.queryString ("iconAnchorX")),
                                "y": Number(Utils.queryString ("iconAnchorY"))
                            }
                        },
                        "infowin": {
                            "content": Number(Utils.queryString ("infoWindowContent"))
                        },
                        "visible": true
                    }
                ]
            };

            return handleMapData (mapData);
        }

        // invalid request
        self._$.map.hide();
        self._$.waiter.hide();
        self._$.error.text("Please provide a map id or use the queryString ");
    }
};

return module; });
