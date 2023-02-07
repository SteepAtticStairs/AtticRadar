var map = require('./map');

function moveLayerToTop(layerName) {
    if (map.getLayer(layerName)) {
        map.moveLayer(layerName);
    }
}

function setLayerOrder() {
    var stormTrackLayers = window.atticData.stormTrackLayers;

    moveLayerToTop('baseReflectivity');
    moveLayerToTop('radioStationLayer');

    moveLayerToTop('mainAlertsLayerOutline');
    moveLayerToTop('mainAlertsLayer');
    moveLayerToTop('mainAlertsLayerFill');

    if (stormTrackLayers != undefined) {
        for (var i in stormTrackLayers) {
            moveLayerToTop(stormTrackLayers[i]);
        }
    }

    moveLayerToTop('stationSymbolLayer');
}

module.exports = setLayerOrder;