const fetch_data = require('./fetch_data');
const click_listener = require('./click_listener');
const set_layer_order = require('../core/map/setLayerOrder');

const div_elem = '#alertMenuItemDiv';
const icon_elem = '#alertMenuItemIcon';

$(icon_elem).on('click', function () {
    if (!$(icon_elem).hasClass('icon-blue')) {
        $(icon_elem).addClass('icon-blue');
        $(icon_elem).removeClass('icon-grey');

        // this checks if an options switch has been changed while the alerts are disabled,
        // but they've already been initialized, so they would just be re-shown otherwise
        const show_warnings = $('#armrWarningsBtnSwitchElem').is(':checked');
        const show_watches = $('#armrWatchesBtnSwitchElem').is(':checked');
        const show_statements = $('#armrStatementsBtnSwitchElem').is(':checked');
        const show_advisories = $('#armrAdvisoriesBtnSwitchElem').is(':checked');
        const show_other = $('#armrOtherBtnSwitchElem').is(':checked');

        if (
            (window.atticData.show_warnings != show_warnings || window.atticData.show_watches != show_watches ||
            window.atticData.show_statements != show_statements || window.atticData.show_advisories != show_advisories ||
            window.atticData.show_other != show_other)
            &&
            (window.atticData.show_warnings != undefined || window.atticData.show_watches != undefined ||
            window.atticData.show_statements != undefined || window.atticData.show_advisories != undefined ||
            window.atticData.show_other != undefined)
        ) {
            fetch_data._fetch_data(() => {
                if (map.getLayer('alertsLayer')) {
                    // map.getCanvas().style.cursor = 'crosshair';
                    map.on('click', 'alertsLayerFill', click_listener);

                    map.setLayoutProperty('alertsLayer', 'visibility', 'visible');
                    map.setLayoutProperty('alertsLayerFill', 'visibility', 'visible');
                    // map.setLayoutProperty('alertsLayerOutline', 'visibility', 'visible');

                    set_layer_order();
                }
            });
        } else {
            if (map.getLayer('alertsLayer')) {
                map.on('click', 'alertsLayerFill', click_listener);

                map.setLayoutProperty('alertsLayer', 'visibility', 'visible');
                map.setLayoutProperty('alertsLayerFill', 'visibility', 'visible');

                set_layer_order();
            }else {
                fetch_data._fetch_data();
            }
        }
    } else if ($(icon_elem).hasClass('icon-blue')) {
        $(icon_elem).removeClass('icon-blue');
        $(icon_elem).addClass('icon-grey');

        map.getCanvas().style.cursor = '';
        map.off('click', 'alertsLayerFill', click_listener);

        map.setLayoutProperty('alertsLayer', 'visibility', 'none');
        map.setLayoutProperty('alertsLayerFill', 'visibility', 'none');
        // map.setLayoutProperty('alertsLayerOutline', 'visibility', 'none');
    }
})