const plotToMap = require('./plot_to_map');
const armFunctions = require('../core/menu/atticRadarMenu');
var map = require('../core/map/map');

armFunctions.toggleswitchFunctions($('#armrWeatherRadioBtnSwitchElem'), function() {
    if (map.getLayer('radioStationLayer')) {
        // layer does exist - toggle the visibility to on
        map.setLayoutProperty('radioStationLayer', 'visibility', 'visible');
    } else {
        // layer doesn't exist - load it onto the map for the first time
        plotToMap();
    }
}, function() {
    // layer does exist - toggle the visibility to off
    map.setLayoutProperty('radioStationLayer', 'visibility', 'none');
})