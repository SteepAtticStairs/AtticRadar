var map = require('./map');

function move_layer_to_top(layer_name, before_layer = undefined) {
    if (map.getLayer(layer_name)) {
        if (before_layer == undefined) {
            map.moveLayer(layer_name);
        } else {
            map.moveLayer(layer_name, before_layer);
        }
    }
}

function setLayerOrder() {
    const before_layer = 'land-structure-line';

    // SPC Outlooks layers
    move_layer_to_top('spc_fill', before_layer);
    move_layer_to_top('spc_border', before_layer);

    // the main radar layer
    move_layer_to_top('baseReflectivity', before_layer);

    // weather radio layer
    move_layer_to_top('radioStationLayer');

    // alerts layers
    move_layer_to_top('alertsLayerOutline');
    move_layer_to_top('alertsLayer');
    move_layer_to_top('alertsLayerFill');

    // storm tracks layers
    const storm_track_layers = window.atticData.storm_track_layers;
    if (storm_track_layers != undefined) {
        for (var i = 0; i < storm_track_layers.length; i++) {
            move_layer_to_top(storm_track_layers[i]);
        }
    }
    const tvs_layers = window.atticData.tvs_layers;
    if (tvs_layers != undefined) {
        for (var i = 0; i < tvs_layers.length; i++) {
            move_layer_to_top(tvs_layers[i]);
        }
    }

    // metar layer
    move_layer_to_top('metarSymbolLayer');

    // lightning layer
    move_layer_to_top('lightningLayer');

    // station marker layer
    move_layer_to_top('stationSymbolLayer');

    // hurricane layers
    const hurricane_layers = window.atticData.hurricane_layers;
    if (hurricane_layers != undefined) {
        for (var i = 0; i < hurricane_layers.length; i++) {
            move_layer_to_top(hurricane_layers[i]);
        }
        for (var i = 0; i < hurricane_layers.length; i++) {
            if (hurricane_layers[i].includes('hurricane_outlook_point')) {
                move_layer_to_top(hurricane_layers[i]);
            }
        }
    }

    // surface fronts layers
    const surface_fronts_layers = window.atticData.surface_fronts_layers;
    if (surface_fronts_layers != undefined) {
        for (var i = 0; i < surface_fronts_layers.length; i++) {
            move_layer_to_top(surface_fronts_layers[i]);
        }
    }
}

module.exports = setLayerOrder;