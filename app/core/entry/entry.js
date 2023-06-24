/*
* This file is the entry point for the project - everything starts here.
*/

function load() {
    // initialize the "atticData" global variable,
    // which will store data that can be accessed globally
    window.atticData = {};

    // load the weather station menu item
    require('../../weather_station/menu_item');

    // load the radio menu item
    require('../../radio/menu_item');

    // initialize the alerts
    require('../../alerts/init_alerts');

    // initialize the METARs module
    require('../../metars/entry');

    // add file upload MENU listeners
    require('../../radar/upload/upload_menu');

    // load the atticRadarMenu helper file
    require('../menu/atticRadarMenu');

    // load the productSelectionMenu helper file
    require('../menu/productSelectionMenu');

    // load the settings menu
    require('../menu/settings');

    // load the data inspector tool
    require('../../radar/inspector/entry');

    // load the station marker menu item
    require('../../radar/station_markers/station_marker_menu');

    // load the radar message listener
    require('../../radar/radar_message/radar_message');

    // load the surface fronts module
    require('../../surface_fronts/menu_item');

    // load the hurricanes module
    require('../../hurricanes/menu_item');

    // load the SPC module
    require('../../spc/menu_item');

    // detect if AtticRadar is being loaded in an iframe
    require('../misc/detect_iframe');

    // load the tide stations module
    require('../../tides/menu_item');

    // $('#settingsItemClass').click();
    // $('#armrSPCOutlooksBtn').click();
    // $('#armrHurricanesBtnSwitchElem').click();
    // $('#armrSPC_convective-hail-day1_BtnSwitchElem').click();
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