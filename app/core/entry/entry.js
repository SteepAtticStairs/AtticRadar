/*
* This file is the entry point for the project - everything starts here.
*/

function load() {
    // initialize the "atticData" global variable,
    // which will store data that can be accessed globally
    window.atticData = {};

    // load the main radar file
    require('../../radar/main');

    // load the weather station menu item
    require('../../weather_station/menu_item').weatherstationToolsOption();

    // load the radio menu item
    require('../../radio/menu_item').weatherRadioToolsOption();

    // initialize the alerts
    require('../../alerts/init_alerts');

    // initialize the hurricanes module
    require('../../hurricanes/entry');

    // initialize the METARs module
    require('../../metars/entry');

    // add file upload MENU listeners
    require('../../radar/upload/upload_menu');

    // load the atticRadarMenu helper file
    require('../menu/atticRadarMenu');

    // load the productSelectionMenu helper file
    require('../menu/productSelectionMenu');

    // load the settings menu
    require('../menu/settings').settingsOption();

    // load the lightning module
    require('../../lightning/menu_item');

    // load the tools menu
    require('../menu/tools');

    // load the data inspector tool
    require('../../radar/inspector/entry');

    // load the station marker menu item
    require('../../radar/station_markers/station_marker_menu');

    // load the radar message listener
    require('../../radar/radar_message/radar_message');
}

if (document.readyState == 'complete' || document.readyState == 'interactive') {
    load();
} else if (document.readyState == 'loading') {
    window.onload = function () {
        load();
    }
}