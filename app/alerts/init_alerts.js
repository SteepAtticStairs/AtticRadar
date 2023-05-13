const fetch_data = require('./fetch_data');
const click_listener = require('./click_listener');
const set_layer_order = require('../core/map/setLayerOrder');

const div_elem = '#alertMenuItemDiv';
const icon_elem = '#alertMenuItemIcon';

$(icon_elem).on('click', function () {
    if (!$(icon_elem).hasClass('icon-blue')) {
        $(icon_elem).addClass('icon-blue');
        $(icon_elem).removeClass('icon-grey');

        if (map.getLayer('alertsLayer')) {
            // map.getCanvas().style.cursor = 'crosshair';
            map.on('click', 'alertsLayerFill', click_listener);

            map.setLayoutProperty('alertsLayer', 'visibility', 'visible');
            map.setLayoutProperty('alertsLayerFill', 'visibility', 'visible');
            map.setLayoutProperty('alertsLayerOutline', 'visibility', 'visible');

            set_layer_order();
        } else {
            fetch_data._fetch_data();
        }
    } else if ($(icon_elem).hasClass('icon-blue')) {
        $(icon_elem).removeClass('icon-blue');
        $(icon_elem).addClass('icon-grey');

        map.getCanvas().style.cursor = '';
        map.off('click', 'alertsLayerFill', click_listener);

        map.setLayoutProperty('alertsLayer', 'visibility', 'none');
        map.setLayoutProperty('alertsLayerFill', 'visibility', 'none');
        map.setLayoutProperty('alertsLayerOutline', 'visibility', 'none');
    }
})