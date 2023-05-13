var map = require('../map');

function generateLayer() {
    var geoJSON = new GeoJSONTerminator();
    map.addSource('dayNightLineSource', {
        'type': 'geojson',
        'data': geoJSON
    })
    map.addLayer({
        'id': 'dayNightLineLayer',
        'type': 'fill',
        'source': 'dayNightLineSource',
        'layout': {},
        'paint': {
            'fill-color': '#000',
            'fill-opacity': 0.4
        }
    });
    setInterval(function() {
        if (map.getLayoutProperty('dayNightLineLayer', 'visibility') != 'none') {
            var geoJSON = new GeoJSONTerminator();
            console.log('Updated day-night line.')
            map.getSource('dayNightLineSource').setData(geoJSON);
        }
    }, 5000)
}

function initialize() {
    if (map.loaded()) { generateLayer(); } 
    else { map.on('load', function() { generateLayer(); }) }
}

function toggleVisibility(showHide) {
    if (showHide == 'show') {
        if (map.getLayer('dayNightLineLayer')) {
            // if layer already exists, show the layer because it is invisible
            map.setLayoutProperty('dayNightLineLayer', 'visibility', 'visible');
        } else {
            // layer does not exist - add it to the map for the first time
            initialize();
        }
    } else if (showHide == 'hide') {
        // hide the layer
        map.setLayoutProperty('dayNightLineLayer', 'visibility', 'none');
    }
}

module.exports = {
    //initialize,
    toggleVisibility
}