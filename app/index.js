const ut = require('./utils');
const loaders = require('./loaders');

// list the initial four tilts
loaders.listTilts([1, 2, 3, 4]);

// initialize the mapboxgl map
require('./map/map');

// intialize all level 3 button event listeners
require('./level3/eventListeners');

// initialize the station markers control and code
require('./map/stationMarkers');