Mono Maps
=========
Mono module for [jxMaps application](https://github.com/jillix/Maps).

# Client side

## `self.create (options, callback)`
Creates a new map, marker, infowindow or icon

Arguments
 - `options` is an object containing the following fields
   - `type`: one of the following values: `"map"`, `"marker"`, `"infowin"`, `"icon"`
   - `data`: object that contains the data the must be inserted via crud api
 - `callback`: the callback function

## `self.read (data, callback)`
Reads all maps for the authenticated user.

Arguments
 - `options` is an object containing the following fields
   - `query`: the query that will be passed to crud api
 - `callback`: the callback function

## `self.update (data, callback)`
Updates a map, marker, infowindow or icon

Arguments
 - `options` is an object containing the following fields
   - `type`: one of the following values: `"map"`, `"marker"`, `"infowin"`, `"icon"`
   - `data`: object that will be passed to the crud api
   - `query`: the query that will be passed to crud api
 - `callback`: the callback function

## `self.delete (data, callback)`
Deletes a map, marker, infowindow or icon

Arguments
 - `options` is an object containing the following fields
   - `type`: one of the following values: `"map"`, `"marker"`, `"infowin"`, `"icon"`
   - `query`: the query that will be passed to crud api
 - `callback`: the callback function

## `self.embed (data, callback)`
Gets the needed map information for embed
Not yet implemented

# Changelog

## `dev`
 - No stable version yet

# License
See LICENSE file.
