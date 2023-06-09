const armFunctions = require('../core/menu/atticRadarMenu');
const map = require('../core/map/map');
const init = require('./init');

function _legend(show_hide) {
    const show_legend = $('#armrHurricaneLegendVisBtnSwitchElem').is(':checked');

    const elem = $('#hurricaneLegendDiv');
    const padding = 15;

    elem.css({
        'top': parseFloat($('#map').css('top')) + padding,
        'left': padding
    });

    if (show_legend) {
        if (show_hide == 'show') elem.show();
        else if (show_hide == 'hide') elem.hide();
    }
}

armFunctions.toggleswitchFunctions($('#armrHurricanesBtnSwitchElem'), function() {
    const hurricane_layers = window.atticData.hurricane_layers;

    if (map.getLayer(hurricane_layers?.[0]) || map.getSource(hurricane_layers?.[0])) {
        for (var i = 0; i < hurricane_layers.length; i++) {
            if (map.getLayer(hurricane_layers[i])) {
                map.setLayoutProperty(hurricane_layers[i], 'visibility', 'visible');
            }
        }
        _legend('show');
    } else {
        _legend('show');
        init();
    }
}, function() {
    const hurricane_layers = window.atticData.hurricane_layers;

    for (var i = 0; i < hurricane_layers.length; i++) {
        if (map.getLayer(hurricane_layers[i])) {
            map.setLayoutProperty(hurricane_layers[i], 'visibility', 'none');
        }
    }
    _legend('hide');
})