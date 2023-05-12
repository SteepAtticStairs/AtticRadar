const get_polygon_colors = require('./colors/polygon_colors');
const set_layer_order = require('../radar/map/setLayerOrder');
const click_listener = require('./click_listener');

function add_alert_layers(geojson) {
    map.addSource(`alertsSource`, {
        type: 'geojson',
        data: geojson,
    })
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

    map.on('mouseover', `alertsLayerFill`, function(e) {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseout', `alertsLayerFill`, function(e) {
        map.getCanvas().style.cursor = '';
    });

    map.on('click', `alertsLayerFill`, click_listener);
}

function sort_by_priority(data) {
    var origData = structuredClone(data);

    var indexArr = [];
    for (var i in data.features) {
        indexArr.push([data.features[i].properties.priority, i])
    }
    indexArr.sort(function(a, b) { return a[0] - b[0] })
    data.features = [];
    for (var i in indexArr) {
        data.features.push(origData.features[indexArr[i][1]]);
    }
    // for (var i in data.features) { console.log(data.features[i].properties.priority) }
    return data;
}

function plot_alerts(alerts_data) {
    for (var item in alerts_data.features) {
        var gpc = get_polygon_colors(alerts_data.features[item].properties.event); // gpc = get polygon colors
        alerts_data.features[item].properties.color = gpc.color;
        alerts_data.features[item].properties.priority = parseInt(gpc.priority);
    }
    alerts_data = sort_by_priority(alerts_data);
    console.log(alerts_data);

    add_alert_layers(alerts_data);

    set_layer_order();
}

module.exports = plot_alerts;