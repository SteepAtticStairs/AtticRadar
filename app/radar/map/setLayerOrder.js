var map = require('./map');

function moveLayerToTop(layerName) {
    if (map.getLayer(layerName)) {
        map.moveLayer(layerName);
    }
}

function setLayerOrder() {
    moveLayerToTop('mainAlertsLayerOutline');
    moveLayerToTop('mainAlertsLayer');
    moveLayerToTop('mainAlertsLayerFill');
}

module.exports = setLayerOrder;