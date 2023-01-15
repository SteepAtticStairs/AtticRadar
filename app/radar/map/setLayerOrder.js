var map = require('./map');

function moveLayerToTop(layerName) {
    if (map.getLayer(layerName)) {
        map.moveLayer(layerName);
    }
}

function setLayerOrder() {
    moveLayerToTop('baseReflectivity');
    moveLayerToTop('radioStationLayer');

    moveLayerToTop('mainAlertsLayerOutline');
    moveLayerToTop('mainAlertsLayer');
    moveLayerToTop('mainAlertsLayerFill');

    moveLayerToTop('stationSymbolLayer');
}

module.exports = setLayerOrder;