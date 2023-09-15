const fetch_data = require('./fetch_data');
const click_listener = require('./click_listener');
const set_layer_order = require('../core/map/setLayerOrder');

const div_elem = '#alertMenuItemDiv';
const icon_elem = '#alertMenuItemIcon';

$(icon_elem).on('click', function () {
    if (!$(icon_elem).hasClass('menu_item_selected')) {
        $(icon_elem).addClass('menu_item_selected');
        $(icon_elem).removeClass('menu_item_not_selected');

        // this checks if an options switch has been changed while the alerts are disabled,
        // but they've already been initialized, so they would just be re-shown otherwise
        const show_warnings = $('#armrWarningsBtnSwitchElem').is(':checked');
        const show_watches = $('#armrWatchesBtnSwitchElem').is(':checked');
        const show_statements = $('#armrStatementsBtnSwitchElem').is(':checked');

        if (map.getLayer('alertsLayer')) {
            map.on('click', 'alertsLayerFill', click_listener);

            map.setLayoutProperty('alertsLayer', 'visibility', 'visible');
            map.setLayoutProperty('alertsLayerFill', 'visibility', 'visible');

            set_layer_order();
        } else {
            fetch_data._fetch_data();
        }
    } else if ($(icon_elem).hasClass('menu_item_selected')) {
        $(icon_elem).removeClass('menu_item_selected');
        $(icon_elem).addClass('menu_item_not_selected');

        map.getCanvas().style.cursor = '';
        map.off('click', 'alertsLayerFill', click_listener);

        map.setLayoutProperty('alertsLayer', 'visibility', 'none');
        map.setLayoutProperty('alertsLayerFill', 'visibility', 'none');
        // map.setLayoutProperty('alertsLayerOutline', 'visibility', 'none');
    }
})