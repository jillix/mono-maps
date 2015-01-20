Mono Maps
=========
Mono module for [jxMaps application](https://github.com/jillix/Maps).

# Configuration

```js
"mono_maps": {
    "module": "github/jillix/mono-maps/MODULE_VERSION"
  , "roles": MONO_ROLES
  , "config": {
        "options": {
            "map": "JQUERY_SELECTOR"
        }
    }
  , "operations": {
        "create": { "roles": MONO_ROLES }
      , "read":   { "roles": MONO_ROLES }
      , "update": { "roles": MONO_ROLES }
      , "delete": { "roles": MONO_ROLES }
      , "embed":  { "roles": MONO_ROLES }
    }
}
```

# Client side

## `self.create(options, callback)`
Creates a new map, marker, infowindow or icon

Arguments
 - `options` is an object containing the following fields
   - `type`: one of the following values: `"map"`, `"marker"`, `"infowin"`, `"icon"`
   - `data`: object that contains the data the must be inserted via crud api
 - `callback`: the callback function

## `self.read(options, callback)`
Reads all maps for the authenticated user.

Arguments
 - `options` is an object containing the following fields
   - `query`: the query that will be passed to crud api
 - `callback`: the callback function

## `self.update(options, callback)`
Updates a map, marker, infowindow or icon

Arguments
 - `options` is an object containing the following fields
   - `type`: one of the following values: `"map"`, `"marker"`, `"infowin"`, `"icon"`
   - `data`: object that will be passed to the crud api
   - `query`: the query that will be passed to crud api
 - `callback`: the callback function

## `self.delete(options, callback)`
Deletes a map, marker, infowindow or icon

Arguments
 - `options` is an object containing the following fields
   - `type`: one of the following values: `"map"`, `"marker"`, `"infowin"`, `"icon"`
   - `query`: the query that will be passed to crud api
 - `callback`: the callback function

## `self.embed(options, callback)`
Gets the needed map information for embed

 - `options` is an object containing **one** of the following fields
   - `mapId`: the map id that should be loaded
   - `data`: an external URL that sends JSON data in `Map` resource type format.
 - `callback`: the callback function

# Changelog

## `dev`
 - not performing reverse geocoding for `latLng` address searches
 - add new features here

## `v0.3.0`
 - Added dynamic map functionality
 - Map marker clustering fixes

## `v0.2.0`
 - Updated deps

## `v0.1.0`
 - Initial release

# License
See LICENSE file.
