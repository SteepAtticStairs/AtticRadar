const armFunctions = require('../core/menu/atticRadarMenu');
const map = require('../core/map/map');

const HurricaneFetcher = require('./HurricaneFetcher');
const HurricaneParser = require('./HurricaneParser');
const HurricaneFormatter = require('./HurricaneFormatter');
const HurricanePlotter = require('./HurricanePlotter');

function init() {
    new HurricaneFetcher((master_storms_list) => {
        new HurricaneParser(master_storms_list, (master_storms_list) => {
            const formatted = new HurricaneFormatter(master_storms_list);
            new HurricanePlotter(formatted.master_storms_list);
        });
    });
}

armFunctions.toggleswitchFunctions($('#armrHurricanesBtnSwitchElem'), function() {
    const hurricane_layers = window.atticData.hurricane_layers;

    if (map.getLayer(hurricane_layers?.[0]) || map.getSource(hurricane_layers?.[0])) {
        for (var i = 0; i < hurricane_layers.length; i++) {
            if (map.getLayer(hurricane_layers[i])) {
                map.setLayoutProperty(hurricane_layers[i], 'visibility', 'visible');
            }
        }
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
})