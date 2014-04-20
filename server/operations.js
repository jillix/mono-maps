// dependencies
var Api = require ("../apis/api");

/**
 *  This function validates the post data and
 *  returns true if data is valid
 *
 */
function validateFormData (operation, data, link) {

    // operation validators
    var validators = {

        // template names
        _validTypes: ["map", "marker", "infowin", "icon"]
      , _validateObject: function (obj, name) {

            // validate data
            if (!obj || obj.constructor !== Object) {
                return link.send (400, name + " must be an object.");
            }

            return true;
        }

        /*
         *  Create operation validator
         * */
      , create: function () {

            // type
            if (!data.type || data.type.constructor !== String) {
                return link.send (400, "type field must be a non empty string.");
            }

            // validate type
            if (validators._validTypes.indexOf(data.type) === -1) {
                return link.send (400, "Invalid type.");
            }

            // validate data
            return validators._validateData (data.data, "Data");
        }

        /*
         *  Read operation validator
         * */
      , read: function () {

            // validate query
            return validators._validateData (data.query, "Query");
        }

        /*
         *  Update operation validator
         * */
      , update: function () {

            // type
            if (!data.type || data.type.constructor !== String) {
                return link.send (400, "type field must be a non empty string.");
            }

            // validate type
            if (validators._validTypes.indexOf(data.type) === -1) {
                return link.send (400, "Invalid type.");
            }

            // validate query and data
            if (validators._validateObject (data.query, "Query") === true) {
                return validators._validateObject (data.data, "Data");
            }

            return true;
        }

        /*
         *  Delete operation validator
         * */
      , delete: function () {

            // type
            if (!data.type || data.type.constructor !== String) {
                return link.send (400, "type field must be a non empty string.");
            }

            // validate type
            if (validators._validTypes.indexOf(data.type) === -1) {
                return link.send (400, "Invalid type.");
            }

            // validate query
            if (!data.query || data.query.constructor !== Object) {
                return link.send (400, "Query must be an object.");
            }

            return true;
        }
    }

    // call validators
    return validators[operation]();
}

/**
 *  This function is called when the response
 *  from CRUD comes
 *
 * */
function handleResponse (link, err, data) {

    // handle error
    if (err) {
        return link.send (400, err);
    }

    // send success
    link.send (200, data);
}

/**
 *  mono-maps#create
 *  Create a new map
 *
 */
exports.create = function (link) {

    // get data, params
    var data = Object(link.data);

    // validate data
    if (validateFormData ("create", data, link) !== true) {
        return;
    }

    // create map, marker, infowindow or icon
    Api[data.type].create ({
        data: data.data
    }, function (err, data) {
        handleResponse (link, err, data);
    });
};

/**
 *  mono-maps#read
 *  Read maps
 *
 */
exports.read = function (link) {

    // get data
    var data = Object(link.data);

    // validate data
    if (validateFormData ("create", data, link) !== true) {
        return;
    }

    // read map
    Api.map.read ({
        query: data.query
    }, function (err, data) {
        handleResponse (link, err, data);
    });
};

/**
 *  mono-maps#update
 *  Update a map/marker/infowin/icon
 *
 */
exports.update = function (link) {

    // get data
    var data = Object (link.data);

    // validate data
    if (validateFormData ("create", data, link) !== true) {
        return;
    }

    // create map, marker, infowindow or icon
    Api[data.type].create ({
        query: data.query
      , data: data.data
    }, function (err, data) {
        handleResponse (link, err, data);
    });
};

/**
 *  mono-maps#delete
 *  Delete a map
 *
 */
exports.delete = function (link) {

    // get data
    var data = Object (link.data);

    // validate data
    if (validateFormData ("create", data, link) !== true) {
        return;
    }

    // create map, marker, infowindow or icon
    Api[data.type].create ({
        query: data.query
    }, function (err, data) {
        handleResponse (link, err, data);
    });
};

/**
 *  mono-maps#embed
 *  Embeds a map
 *
 */
exports.embed = function (link) {

    // get data, params
    var data = Object (link.data);

    // TODO Crud call
};
