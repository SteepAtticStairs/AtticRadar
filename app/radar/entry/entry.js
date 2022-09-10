/*
* This file is the entry point for the project - everything starts here.
*/

window.onload = function() {
    // load the main file
    require('../main');

    // initialize the alerts
    require('../../alerts/entry');

    // initialize the hurricanes module
    //require('../../hurricanes/entry');

    // load the tides chart
    require('../../tides/main').tideChartInit('container');

    // initialize the METARs module
    //require('../../metars/entry');
}