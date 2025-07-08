/*
* This file is the entry point for the project - everything starts here.
*/

// initialize the "attic_data" global variable,
// which will store data that can be accessed globally
window.attic_data = {};

// runs after the map loads
function load() {
    // change the openfreemap style a little bit
    // this needs to happen after we're sure the map has loaded
    require('../map/update_style');

    // initialize the alerts module
    require('../../alerts/entry');
}

function _load_map() {
    const map = require('../map/map');
    if (map.loaded()) {
        load();
    } else {
        map.on('load', function() {
            load();
        })
    }
}

if (document.readyState == 'complete' || document.readyState == 'interactive') {
    _load_map();
} else if (document.readyState == 'loading') {
    window.onload = function () {
        _load_map();
    }
}