// dependencies
var ObjectId = require ("mongodb").ObjectID;

/*
 *  This function creates the crud object and send it to crud
 *  via server events
 *
 * */
function runCrudRequest (options) {

    // create the crud object
    var crudObject = {
        templateId: options.templateId
      , noJoins: options.noJoins
      , role: options.role
      , options: options.options
      , query: options.query
      , data: options.data
      , noCursor: true
    };

    // send the crud object and the callback to
    // crud module via server events
    M.emit ("crud." + options.method, crudObject, options.callback);
}

/*
 *  These are the crud methods
 *
 * */
module.exports = {
    /*
     * CREATE
     *
     * */
    create: function (options, callback) {
        runCrudRequest ({
            role:       ObjectId('53500045f607d65614ad00fb')
          , templateId: options.templateId
          , method:     "create"
          , data:       options.data
          , options: options.options
          , callback:   options.callback
        });
    }

    /*
     *  READ
     *
     * */
  , read: function (options, callback) {
        runCrudRequest ({
            role:       ObjectId('53500045f607d65614ad00fb')
          , noJoins:    options.noJoins
          , templateId: options.templateId
          , method:     "read"
          , query:      options.query
          , options:    options.options
          , callback:   options.callback
        });
    }

    /*
     *  UPDATE
     *
     * */
  , update: function (options, callback) {
        runCrudRequest ({
            role:       ObjectId('53500045f607d65614ad00fb')
          , templateId: options.templateId
          , method:     "update"
          , query:      options.query
          , data:       options.data
          , options:    { multi: true }
          , callback:   options.callback
        });
    }

    /*
     *  DELETE
     *
     * */
  , delete: function (options, callback) {
        runCrudRequest ({
            role:       ObjectId('53500045f607d65614ad00fb')
          , templateId: options.templateId
          , method:     "delete"
          , query:      options.query
          , options:    options.options
          , callback:   options.callback
        });
    }
};
