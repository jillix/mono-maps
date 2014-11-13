// Dependencies
var Bind = require("github/jillix/bind");
var Events = require("github/jillix/events");
var Utils = require("github/jillix/utils");

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
    config.options = Object(config.options);
    config.options.ui = Object(config.options.ui);

    // run the binds
    for (var i = 0; i < config.binds.length; ++i) {
        Bind.call(self, config.binds[i]);
    }

    // set config in self
    self.config = config;
    self._maps = {};

    // ui
    self._$ = {
        map: $(self.config.options.ui.map),
        waiter: $(self.config.options.ui.waiter),
        error: $(self.config.options.ui.error)
    };

    // crud operations
    var operations = ["create", "read", "update", "delete"];

    // generate client methods
    for (var i = 0; i < operations.length; ++i) {
        (function(op) {
            self[op] = function(options, callback) {
                self.link(op, {
                    data: options
                }, callback);
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
    self.embed = function(options, callback) {

        // update ui
        self._$.map.hide();
        self._$.waiter.show();

        // default value for callback
        callback = callback || function() {};

        // call server operation
        self.link("embed", {
            data: options
        }, function(err, mapData) {

            // handle error
            if (err) {

                // update UI
                self._$.waiter.fadeOut();
                self._$.error.fadeIn().text(err);

                return callback(err);
            }

            handleMapData(mapData);
        });
    };

    /**
     * handleMapData
     * This function attaches the map data to the module instance
     *
     * @param mapData
     * @return
     */
    function handleMapData(mapData) {

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
    window.__initializeMap = function(mapData) {

        var geocoder = self._geocoder = new google.maps.Geocoder();
        // handle ?address parameter
        if (self._maps._addressMap) {
            return geocoder.geocode({
                address: Url.queryString("address")
            }, function(results, status) {
                var loc = results[0].geometry.location;
                if (!loc) {
                    return console.error("No location found");
                }
                var strLoc = loc.toString().replace(/\(|\)/g, "").split(", ");
                var lat = strLoc[0];
                var lng = strLoc[1];

                // set lng and lat values and delete address param
                Url.updateSearchParam("options.center.lng", lng);
                Url.updateSearchParam("options.center.lat", lat);
                Url.updateSearchParam("address");
                if (Url.queryString("displayMarker")) {
                    Url.updateSearchParam("markers.0.position.lng", lng);
                    Url.updateSearchParam("markers.0.position.lat", lat);
                }
                location.reload();
            });
        }

        // no map data
        if (!mapData) {
            for (var mapId in self._maps) {
                __initializeMap(self._maps[mapId]);
            }
            return;
        }

        // get map element
        var mapEl = self._$.map[0];
        if (!mapEl) {
            return console.error("No map element found.");
        }

        // map options
        var mapOptions = {
            center: new google.maps.LatLng(
                mapData.options.center.lat, mapData.options.center.lng
            ),
            zoom: mapData.options.zoom,
            mapTypeId: google.maps.MapTypeId[mapData.options.type]
        };

        // save google maps instance in _gmap
        self._gmap = new google.maps.Map(mapEl, mapOptions);

        // default value for markers
        var markers = mapData.markers = mapData.markers || [];
        var allMarkers = [];
        var lastInfoWindow = null;

        // each marker
        for (var i = 0; i < markers.length; ++i) {

            (function(cMarker) {

                if (!cMarker.position) {
                    return;
                }

                // icon exists
                if (cMarker.icon) {

                    cMarker.icon = new google.maps.MarkerImage(
                        cMarker.icon.path, new google.maps.Size(
                            cMarker.icon.size.w, cMarker.icon.size.h
                        ), new google.maps.Point(
                            cMarker.icon.origin.x, cMarker.icon.origin.y
                        ), new google.maps.Point(
                            cMarker.icon.anchor.x, cMarker.icon.anchor.y
                        )
                    );
                }

                // create google marker
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(cMarker.position.lat, cMarker.position.lng),
                    map: self._gmap,
                    title: cMarker.title || "",
                    icon: cMarker.icon || undefined,
                    visible: cMarker.visible
                });

                // infowin exists
                if (cMarker.infowin) {
                    cMarker.infowin = new google.maps.InfoWindow({
                        content: cMarker.infowin.content
                    });
                }

                // push the new marker
                allMarkers.push(marker);

                // add click event for info window
                google.maps.event.addListener(marker, "click", function() {
                    if (!cMarker.infowin) return;
                    if (lastInfoWindow) {
                        lastInfoWindow.close();
                    }

                    (lastInfoWindow = cMarker.infowin).open(self._gmap, marker);
                });
            })(markers[i]);
        }

        // marker clusterer
        if (mapData.options.clustering) {
            self._gmarkerClusterer = new MarkerClusterer(self._gmap, allMarkers, mapData.options.clustering.options);
        }

        // update ui
        self._$.map.fadeIn();
        self._$.waiter.fadeOut();
    };

    // PostMesage API
    $(window).on("message", function(event) {
        event.data = event.originalEvent.data;
        if (!event.data || !event.data.method) {
            throw new Error("No method defined.");
        }

        var methods = {
            search: function(d) {
                d = Object(d);
                self._geocoder.geocode(d.geocode, function(res) {

                    if (!res || !res[0]) {
                        return;
                    }

                    var p = res[0].geometry.location;

                    google.maps.event.trigger(self._gmap, "resize");
                    self._gmap.setCenter(p || self.center);

                    if (p) {
                        self._gmap.setZoom(11);
                    } else {
                        self._gmap.setZoom(8);
                    }
                });
            }
        };

        if (typeof methods[event.data.method] !== "function") {
            throw new Error("Provided method is not a function.");
        }

        methods[event.data.method](event.data.data);
    });

    // emit ready
    self.emit("ready", self);

    // we are on the embed page
    if (
        location.pathname + location.hash === self.config.options.embedPage && self.config.options.automaticallyEmbed !== false
    ) {

        // get the map id
        var mapId = Url.queryString("mapId");
        var dataUrl = Url.queryString("data");
        var lat = Url.queryString("options.center.lat");
        var lng = Url.queryString("options.center.lng");
        var address = Url.queryString("address");

        // map id was provided
        if (mapId) {
            return self.embed({
                mapId: mapId
            });
        }

        if (dataUrl) {
            return self.embed({
                data: dataUrl
            });
        }

        if (address) {
            return handleMapData({
                address: address,
                _id: "_addressMap"
            });
        }

        // querystring api
        if (lat && lng) {

            var validators = {
                number: function(val) {
                    return isNaN(val) ? undefined : Number(val);
                }
            };

            var fields = {
                "name": {
                    default: "No name"
                },
                "options.center.lat": {
                    validator: validators.number
                },
                "options.center.lng": {
                    validator: validators.number
                },
                "options.zoom": {
                    validator: validators.number,
                    default: 15
                },
                "options.type": {
                    default: "ROADMAP"
                },
                "markers.0.label": {},
                "markers.0.title": {},
                "markers.0.position.lat": {
                    validator: validators.number
                },
                "markers.0.position.lng": {
                    validator: validators.number
                },
                "markers.0.icon.path": {},
                "markers.0.icon.label": {},
                "markers.0.icon.size.w": {
                    default: 100,
                    validator: validators.number
                },
                "markers.0.icon.size.h": {
                    default: 100,
                    validator: validators.number
                },
                "markers.0.icon.origin.x": {
                    default: 0,
                    validator: validators.number
                },
                "markers.0.icon.origin.y": {
                    default: 0,
                    validator: validators.number
                },
                "markers.0.icon.anchor.x": {
                    default: 0,
                    validator: validators.number
                },
                "markers.0.icon.anchor.y": {
                    default: 0,
                    validator: validators.number
                },
                "markers.0.infowin.content": {},
                "markers.0.visible": {
                    default: true
                }
            };

            function iconLoaded() {
                // set map data
                var mapData = {};
                var searchQueryObj = Url.parseSearchQuery();
                for (var field in fields) {
                    if (!fields.hasOwnProperty(field)) continue;
                    var cFieldVal = fields[field];
                    var paramValue = searchQueryObj[field];
                    var valueToSet = paramValue || cFieldVal.default;
                    if (cFieldVal.validator) {
                        valueToSet = cFieldVal.validator(valueToSet);
                    }
                    mapData[field] = valueToSet;
                    if (mapData[field] === undefined) {
                        delete mapData[field];
                    }
                }

                if (!mapData["markers.0.icon.path"]) {
                    for (var m in mapData) {
                        if (!/^markers\./.test(m)) {
                            continue;
                        }
                        console.log("deleting " + m);
                        delete mapData[m];
                    }
                }

                mapData = Utils.unflattenObject(mapData);
                if (mapData.markers) {
                    mapData.markers.length = 1;
                }

                handleMapData(mapData);
            }

            var iconImgSrc = Url.queryString("markers.0.icon.path");
            if (iconImgSrc) {
                var iconImg = new Image();
                iconImg.src = iconImgSrc;
                return $(iconImg).load(function() {
                    fields["markers.0.icon.anchor.x"]["default"] = iconImg.width / 2;
                    fields["markers.0.icon.anchor.y"]["default"] = iconImg.height / 2 + iconImg.height / 3;
                    iconLoaded();
                });
            } else {
                return iconLoaded();
            }
        }

        // invalid request
        self._$.map.hide();
        self._$.waiter.hide();
        self._$.error.text("Please provide a map id or use the query string API.");
    }
};

