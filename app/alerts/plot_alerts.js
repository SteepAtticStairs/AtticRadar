const get_polygon_colors = require('./colors/polygon_colors');
const set_layer_order = require('../core/map/setLayerOrder');
const click_listener = require('./click_listener');

const alerts_whitelist = [
    'Tornado Warning',
    'Severe Thunderstorm Warning',
    'Flash Flood Warning',
    'Special Marine Warning',
    'Snow Squall Warning',
];

function add_alert_layers(geojson) {
    map.addSource(`alertsSource`, {
        type: 'geojson',
        data: geojson,
    })
    map.addLayer({
        'id': `alertsLayerOutline`,
        'type': 'line',
        'source': `alertsSource`,
        'paint': {
            //#014385 blue
            //#850101 red
            'line-color': 'black',
            'line-width': 8
        }
    });
    map.addLayer({
        'id': `alertsLayer`,
        'type': 'line',
        'source': `alertsSource`,
        'paint': {
            //#014385 blue
            //#850101 red
            'line-color': ['get', 'color'],
            'line-width': 3
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

function _sort_by_priority(data) {
    data.features = data.features.sort((a, b) => b.properties.priority - a.properties.priority);
    return data;
}

function _filter_alerts(alerts_data) {
    alerts_data.features = alerts_data.features.filter((feature) => {
        const current_alert_name = feature.properties.event;
        return alerts_whitelist.includes(current_alert_name);
    });
    return alerts_data;
}

function plot_alerts(alerts_data) {
    for (var item in alerts_data.features) {
        var gpc = get_polygon_colors(alerts_data.features[item].properties.event); // gpc = get polygon colors
        alerts_data.features[item].properties.color = gpc.color;
        alerts_data.features[item].properties.priority = parseInt(gpc.priority);
    }
    alerts_data = _sort_by_priority(alerts_data);
    alerts_data = _filter_alerts(alerts_data);
    console.log(alerts_data);

    add_alert_layers(alerts_data);

    set_layer_order();
}

module.exports = plot_alerts;