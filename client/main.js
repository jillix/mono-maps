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
        self.link ("embed", { data: options}, function (err, data) {

            // handle error
            if (err) {
                return callback (err);
            }

            if (!$(self.options.map).length) {
                console.error ("No map element found.");
            }
        });
    }

    // emit ready
    self.emit("ready", self);
};
