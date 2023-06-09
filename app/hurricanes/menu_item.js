const armFunctions = require('../core/menu/atticRadarMenu');
const map = require('../core/map/map');
const init = require('./init');

armFunctions.toggleswitchFunctions($('#armrHurricanesBtnSwitchElem'), function() {
    const hurricane_layers = window.atticData.hurricane_layers;

    if (map.getLayer(hurricane_layers?.[0]) || map.getSource(hurricane_layers?.[0])) {
        for (var i = 0; i < hurricane_layers.length; i++) {
            if (map.getLayer(hurricane_layers[i])) {
                map.setLayoutProperty(hurricane_layers[i], 'visibility', 'visible');
            }
        }
        $('#hurricaneLegendDiv').show();
    } else {
        init();
    }
}, function() {
    const hurricane_layers = window.atticData.hurricane_layers;

    for (var i = 0; i < hurricane_layers.length; i++) {
        if (map.getLayer(hurricane_layers[i])) {
            map.setLayoutProperty(hurricane_layers[i], 'visibility', 'none');
        }
    }
    $('#hurricaneLegendDiv').hide();
})