/*
* This file is the entry point for the project - everything starts here.
*/

// load the main file
require('../main');

// load the station markers control (this has to be after everything else is loaded)
require('../map/controls/stationMarkers');

// load the tides chart
// require('../../tides/main').tideChartInit('container');

// initialize the alerts
require('../../alerts/entry');