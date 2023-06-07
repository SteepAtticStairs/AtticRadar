const map = require('../core/map/map');
const set_layer_order = require('../core/map/setLayerOrder');

function _hide_layers() {
    if (map.getLayer('spc_fill')) {
        // map.setLayoutProperty('spc_fill', 'visibility', 'none');
        // map.setLayoutProperty('spc_border', 'visibility', 'none');
        map.removeLayer('spc_fill');
        map.removeLayer('spc_border');
        map.removeSource('spc_source');
    }
}

function _click_listener(e) {
    console.log(e)
    for (var i = 0; i < e.features.length; i++) {
        const properties = e.features[i].properties;

        const popup_html = 
`<div><b>${properties.LABEL2}</b></div>`

        new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000' })
        .setLngLat(e.lngLat)
        .setHTML(popup_html)
        .addTo(map);
    }
}

function plot_data(geojson) {
    _hide_layers();

    map.addSource('spc_source', {
        'type': 'geojson',
        data: geojson
    });

    // fill
    map.addLayer({
        'id': 'spc_fill',
        'type': 'fill',
        'source': 'spc_source',
        'paint': {
            'fill-color': ['get', 'fill'],
            'fill-opacity': 0.5
        }
    });
    // outline
    map.addLayer({
        'id': 'spc_border',
        'type': 'line',
        'source': 'spc_source',
        'paint': {
            'line-color': ['get', 'stroke'],
            'line-width': 3
        }
    });

    set_layer_order();

    map.off('click', 'spc_fill', _click_listener);
    map.on('click', 'spc_fill', _click_listener);
}

module.exports = plot_data;