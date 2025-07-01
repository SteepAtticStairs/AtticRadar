const fetch_data = require('./fetch_data');
const armFunctions = require('../core/menu/atticRadarMenu');
const map = require('../core/map/map');

armFunctions.toggleswitchFunctions($('#armrTideStationsBtnSwitchElem'), function() {
    if (map.getLayer('tide_station_layer')) {
        // layer does exist - toggle the visibility to on
        map.setLayoutProperty('tide_station_layer', 'visibility', 'visible');
    } else {
        // layer doesn't exist - load it onto the map for the first time
        fetch_data();
    }
}, function() {
    // layer does exist - toggle the visibility to off
    map.setLayoutProperty('tide_station_layer', 'visibility', 'none');
})