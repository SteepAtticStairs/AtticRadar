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

    move_layer_to_top('spc_fill', before_layer);
    move_layer_to_top('spc_border', before_layer);

    move_layer_to_top('baseReflectivity', before_layer);

    move_layer_to_top('radioStationLayer');

    move_layer_to_top('alertsLayerOutline');
    move_layer_to_top('alertsLayer');
    move_layer_to_top('alertsLayerFill');
    var storm_track_layers = window.atticData.storm_track_layers;
    if (storm_track_layers != undefined) {
        for (var i in storm_track_layers) {
            move_layer_to_top(storm_track_layers[i]);
        }
    }
    var tvs_layers = window.atticData.tvs_layers;
    if (tvs_layers != undefined) {
        for (var i in tvs_layers) {
            move_layer_to_top(tvs_layers[i]);
        }
    }

    move_layer_to_top('metarSymbolLayer');

    move_layer_to_top('lightningLayer');

    move_layer_to_top('stationSymbolLayer');

    var surface_fronts_layers = window.atticData.surface_fronts_layers;
    if (surface_fronts_layers != undefined) {
        for (var i in surface_fronts_layers) {
            move_layer_to_top(surface_fronts_layers[i]);
        }
    }
}

module.exports = setLayerOrder;