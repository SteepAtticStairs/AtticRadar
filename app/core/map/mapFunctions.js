var map = require('./map');

function removeMapLayer(layername) {
    if (map.getLayer(layername)) {
        map.removeLayer(layername);
    }
    if (map.getSource(layername)) {
        map.removeSource(layername);
    }
}
function setGeojsonLayer(gj, gjType, identity) {
    var styling;
    var type;
    if (gjType == 'circle') {
        type = gjType;
        styling = {
            'circle-radius': 4,
            'circle-stroke-width': 2,
            'circle-color': 'red',
            'circle-stroke-color': 'white',
        }
    } else if (gjType == 'lineCircle') {
        type = 'circle';
        styling = {
            'circle-radius': 4,
            'circle-stroke-width': 2,
            'circle-color': 'blue',
            'circle-stroke-color': 'white',
        }
    } else if (gjType == 'greenCircle') {
        type = 'circle';
        styling = {
            'circle-radius': 4,
            'circle-stroke-width': 2,
            'circle-color': 'green',
            'circle-stroke-color': 'white',
        }
    } else if (gjType == 'yellowCircle') {
        type = 'circle';
        styling = {
            'circle-radius': 4,
            'circle-stroke-width': 2,
            'circle-color': 'yellow',
            'circle-stroke-color': 'white',
        }
    } else if (gjType == 'lineCircleEdge') {
        type = 'circle';
        styling = {
            'circle-radius': 4,
            'circle-color': '#ffffff',
        }
    } else if (gjType == 'line') {
        type = gjType;
        styling = {
            'line-color': '#ffffff',
            'line-width': 1.5,
        }
    }
    map.addLayer({
        'id': identity,
        'type': type,
        'source': {
            'type': 'geojson',
            'data': gj,
        },
        'paint': styling,
    })
}
function moveMapLayer(lay) {
    if (map.getLayer(lay)) {
        map.moveLayer(lay)
    }
}

function get_base_layer() {
    const current_style_name = window.atticData.map_type; // map.getStyle().name;

    if (current_style_name == 'satellite') {
        return 'tunnel-path-trail';
    } else if (current_style_name == 'dark') {
        return 'land-structure-line';
    } else if (current_style_name == 'light') {
        return 'land-structure-line';
    }
}

module.exports = {
    removeMapLayer,
    setGeojsonLayer,
    moveMapLayer,
    get_base_layer
}