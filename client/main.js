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

    // run the binds
    for (var i = 0; i < config.binds.length; ++i) {
        Bind.call(self, config.binds[i]);
    }

    // set config in self
    self.config = config;

    // TODO public functions

    // emit ready
    self.emit("ready", self.config);
};
