/*
* This file is the entry point for the project - everything starts here.
*/

function load() {
    // load the main file
    require('../main');

    // initialize the weather station module
    require('../../weather-station/entry');

    // initialize the mPING module
    require('../../mping/entry');

    // initialize the weather radio module
    require('../../radio/entry');

    // initialize the alerts
    require('../../alerts/entry');

    // initialize the hurricanes module
    require('../../hurricanes/entry');

    // initialize the METARs module
    require('../../metars/entry');

    // initialize the satellite module
    require('../../satellite/entry');

    // load the tides chart
    require('../../tides/main').tideChartInit('container');

    // set the menu order
    const setMenuOrder = require('../menu/setMenuOrder');
    setMenuOrder.setFooterMenuOrder();
}

if (document.readyState == 'complete' || document.readyState == 'interactive') {
    load();
} else if (document.readyState == 'loading') {
    window.onload = function() {
        load();
    }
}