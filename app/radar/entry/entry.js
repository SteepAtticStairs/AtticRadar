/*
* This file is the entry point for the project - everything starts here.
*/

function load() {
    // load the main file
    require('../main');

    // initialize the alerts
    require('../../alerts/entry');

    // initialize the hurricanes module
    require('../../hurricanes/entry');

    // initialize the METARs module
    require('../../metars/entry');

    // initialize the satellite module
    //require('../../satellite/entry');

    // load the tides chart
    require('../../tides/main').tideChartInit('container');

    // add the reload control
    require('../map/controls/reload');
}

if (document.readyState == 'complete' || document.readyState == 'interactive') {
    load();
} else if (document.readyState == 'loading') {
    window.onload = function() {
        load();
    }
}