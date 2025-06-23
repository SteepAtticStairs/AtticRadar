const fetch_data = require('./fetch_data');
const click_listener = require('./click_listener');
const set_layer_order = require('../core/map/setLayerOrder');
const filter_alerts = require('./filter_alerts');
const plot_alerts = require('./plot_alerts');

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

            _show_layer('alertsLayer');
            _show_layer('alertsLayerFill');

            if ($('#armrWatchesBtnSwitchElem').is(':checked')) {
                _show_layer('watches_layer');
                _show_layer('watches_layer_fill');
            }
            if ($('#armrDiscussionsBtnSwitchElem').is(':checked')) {
                _show_layer('discussions_layer');
                _show_layer('discussions_layer_fill');
            }

            set_layer_order();
        } else {
            fetch_data._fetch_data();
        }
    } else if ($(icon_elem).hasClass('menu_item_selected')) {
        $(icon_elem).removeClass('menu_item_selected');
        $(icon_elem).addClass('menu_item_not_selected');

        map.getCanvas().style.cursor = '';
        map.off('click', 'alertsLayerFill', click_listener);

        _hide_layer('alertsLayer');
        _hide_layer('alertsLayerFill');

        _hide_layer('watches_layer');
        _hide_layer('watches_layer_fill');

        _hide_layer('discussions_layer');
        _hide_layer('discussions_layer_fill');
        // map.setLayoutProperty('alertsLayerOutline', 'visibility', 'none');
    }
})

function _show_layer(layer) { if (map.getLayer(layer)) { map.setLayoutProperty(layer, 'visibility', 'visible') } }
function _hide_layer(layer) { if (map.getLayer(layer)) { map.setLayoutProperty(layer, 'visibility', 'none') } }

$('.alert_options_btn').click(function() {
    var filtered;
    if (window.atticData?.alerts_data != undefined) {
        filtered = filter_alerts(JSON.parse(JSON.stringify(window.atticData.alerts_data)));
        plot_alerts(filtered);
    }
})