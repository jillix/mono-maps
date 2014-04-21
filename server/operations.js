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
            return validators._validateObject (data.data, "Data");
        }

        /*
         *  Read operation validator
         * */
      , read: function () {

            // validate query
            return validators._validateObject (data.query, "Query");
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

    // is the user logged in?
    if (!link.session || !link.session.userId || !link.session.userId.toString()) {
        return link.session (403, "You are not logged in.");
    }

    // call validators
    if (validators[operation]() === true) {

        // add owner types
        switch (operation) {
            case "create":
                data.data.owner = link.session.userId.toString();
                return true;
            case "read":
                data.query.owner = link.session.userId.toString();
                return true;
            case "update":
                data.data.owner = link.session.userId.toString();
                data.query.owner = link.session.userId.toString();
                return true;
            case "delete":
                data.query.owner = link.session.userId.toString();
                return true;
            default:
                link.send (200, "Invalid operation");
                return false;
        }
    }
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
    if (validateFormData ("read", data, link) !== true) {
        return;
    }

    // read map
    Api[data.type].read ({
        query: data.query
      , noJoins: true
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
    if (validateFormData ("update", data, link) !== true) {
        return;
    }

    // create map, marker, infowindow or icon
    Api[data.type].update ({
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
    if (validateFormData ("delete", data, link) !== true) {
        return;
    }

    // create map, marker, infowindow or icon
    Api[data.type].delete ({
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
