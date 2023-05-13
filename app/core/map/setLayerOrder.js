var map = require('./map');

function moveLayerToTop(layerName) {
    if (map.getLayer(layerName)) {
        map.moveLayer(layerName);
    }
}

function setLayerOrder() {
    // moveLayerToTop('baseReflectivity');
    moveLayerToTop('radioStationLayer');

    // var isRoadsStreetsVisChecked = $('#armrRoadsStreetsVisBtnSwitchElem').is(':checked');
    // if (!isRoadsStreetsVisChecked) {
    //     setBaseMapLayers('cities');
    // } else if (isRoadsStreetsVisChecked) {
    //     setBaseMapLayers('both');
    // }

    moveLayerToTop('alertsLayerOutline');
    moveLayerToTop('alertsLayer');
    moveLayerToTop('alertsLayerFill');

    moveLayerToTop('lightningLayer');

    var storm_track_layers = window.atticData.storm_track_layers;
    if (storm_track_layers != undefined) {
        for (var i in storm_track_layers) {
            moveLayerToTop(storm_track_layers[i]);
        }
    }
    var tvs_layers = window.atticData.tvs_layers;
    if (tvs_layers != undefined) {
        for (var i in tvs_layers) {
            moveLayerToTop(tvs_layers[i]);
        }
    }

    moveLayerToTop('stationSymbolLayer');
}

module.exports = setLayerOrder;