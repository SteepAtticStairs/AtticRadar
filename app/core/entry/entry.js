/*
* This file is the entry point for the project - everything starts here.
*/

function load() {
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