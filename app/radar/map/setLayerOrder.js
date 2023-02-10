var map = require('./map');
const setBaseMapLayers = require('../misc/baseMapLayers');

function moveLayerToTop(layerName) {
    if (map.getLayer(layerName)) {
        map.moveLayer(layerName);
    }
}

function setLayerOrder() {
    var stormTrackLayers = window.atticData.stormTrackLayers;

    moveLayerToTop('baseReflectivity');
    moveLayerToTop('radioStationLayer');

    var isRoadsStreetsVisChecked = $('#armrRoadsStreetsVisBtnSwitchElem').is(':checked');
    if (!isRoadsStreetsVisChecked) {
        setBaseMapLayers('cities');
    } else if (isRoadsStreetsVisChecked) {
        setBaseMapLayers('both');
    }

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