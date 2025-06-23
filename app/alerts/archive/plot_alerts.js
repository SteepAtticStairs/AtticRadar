const get_polygon_colors = require('./colors/polygon_colors');
const set_layer_order = require('../core/map/setLayerOrder');
const click_listener = require('./click_listener');
const filter_alerts = require('./filter_alerts');
const map = require('../../core/map/map');
const AlertUpdater = require('./updater/AlertUpdater');

function _add_alert_layers(geojson) {
    if (map.getSource('alertsSource')) {
        map.getSource('alertsSource').setData(geojson);
    } else {
        map.addSource(`alertsSource`, {
            type: 'geojson',
            data: geojson,
        })
        map.addLayer({
            'id': `alertsLayer`,
            'type': 'line',
            'source': `alertsSource`,
            'paint': {
                'line-color': [
                    'case',
                    ['==', ['get', 'type'], 'outline'],
                    ['get', 'color'],
                    ['==', ['get', 'type'], 'border'],
                    'black',
                    'rgba(0, 0, 0, 0)'
                ],
                'line-width': [
                    'case',
                    ['==', ['get', 'type'], 'outline'],
                    2,
                    ['==', ['get', 'type'], 'border'],
                    5,
                    0
                ]
            }
        });
        map.addLayer({
            'id': `alertsLayerFill`,
            'type': 'fill',
            'source': `alertsSource`,
            paint: {
                //#0080ff blue
                //#ff7d7d red
                'fill-color': ['get', 'color'],
                'fill-opacity': 0
            }
        });

        map.on('mouseover', `alertsLayerFill`, function(e) {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseout', `alertsLayerFill`, function(e) {
            map.getCanvas().style.cursor = '';
        });

        map.on('click', `alertsLayerFill`, click_listener);
    }
}

function _sort_by_priority(data) {
    data.features = data.features.sort((a, b) => b.properties.priority - a.properties.priority);
    return data;
}

function plot_alerts(alerts_data) {
    // const already_data = map.getSource('alertsSource')?._data;
    // if (already_data != undefined) {
    //     alerts_data = already_data;
    // }

    for (var item in alerts_data.features) {
        var gpc = get_polygon_colors(alerts_data.features[item].properties.event); // gpc = get polygon colors
        alerts_data.features[item].properties.color = gpc.color;
        alerts_data.features[item].properties.priority = parseInt(gpc.priority);
    }
    alerts_data = _sort_by_priority(alerts_data);
    alerts_data = filter_alerts(alerts_data);

    var duplicate_features = alerts_data.features.flatMap((element) => [element, element]);
    duplicate_features = JSON.parse(JSON.stringify(duplicate_features));
    for (var i = 0; i < duplicate_features.length; i++) {
        if (i % 2 === 0) {
            duplicate_features[i].properties.type = 'border';
        } else {
            duplicate_features[i].properties.type = 'outline';
        }
    }
    alerts_data.features = duplicate_features;
    console.log(alerts_data);

    _add_alert_layers(alerts_data);

    set_layer_order();

    // if (window?.atticData?.current_RadarUpdater != undefined) {
    //     window.atticData.current_RadarUpdater.disable();
    // }
    // if (!isInFileUploadMode) {
    //     const current_RadarUpdater = new RadarUpdater(nexrad_factory);
    //     window.atticData.current_RadarUpdater = current_RadarUpdater;
    //     current_RadarUpdater.enable();
    // }
    if (!window.location.hash.includes('dev')) {
        if (window.atticData.current_AlertUpdater == undefined) {
            const current_AlertUpdater = new AlertUpdater();
            current_AlertUpdater.enable();
            window.atticData.current_AlertUpdater = current_AlertUpdater;
        }
    }
}

module.exports = plot_alerts;