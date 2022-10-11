var map = require('../map');

function generateLayer() {
    var geoJSON = new GeoJSONTerminator();
    map.addLayer({
        'id': 'daynight',
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': geoJSON
        },
        'layout': {},
        'paint': {
            'fill-color': '#000',
            'fill-opacity': 0.4
        }
    });
}

function initialize() {
    if (map.loaded()) { generateLayer(); } 
    else { map.on('load', function() { generateLayer(); }) }
}

function toggleVisibility(showHide) {
    if (showHide == 'show') {
        if (map.getLayer('daynight')) {
            // if layer already exists, show the layer because it is invisible
            map.setLayoutProperty('daynight', 'visibility', 'visible');
        } else {
            // layer does not exist - add it to the map for the first time
            initialize();
        }
    } else if (showHide == 'hide') {
        // hide the layer
        map.setLayoutProperty('daynight', 'visibility', 'none');
    }
}

module.exports = {
    //initialize,
    toggleVisibility
}