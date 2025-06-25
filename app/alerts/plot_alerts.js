const map = require('../core/map/map');
const get_polygon_colors = require('./colors/polygon_colors');

function _add_alert_layers(geojson) {
    if (map.getSource('alerts_source')) {
        map.getSource('alerts_source').setData(geojson);
    } else {
        map.addSource('alerts_source', {
            type: 'geojson',
            data: geojson,
        })
        map.addLayer({
            'id': 'alerts_layer',
            'type': 'line',
            'source': 'alerts_source',
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
            'id': 'alerts_layer_fill',
            'type': 'fill',
            'source': 'alerts_source',
            paint: {
                'fill-color': ['get', 'color'],
                'fill-opacity': 0
            }
        });

        map.on('mouseover', 'alerts_layer_fill', function(e) {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseout', 'alerts_layer_fill', function(e) {
            map.getCanvas().style.cursor = '';
        });

        // map.on('click', 'alerts_layer_fill', click_listener);
    }
}

function _sort_by_priority(data) {
    data.features = data.features.sort((a, b) => b.properties.priority - a.properties.priority);
    return data;
}

function plot_alerts(alerts_data) {
    // console.log(alerts_data);

    for (var item in alerts_data.features) {
        var gpc = get_polygon_colors(alerts_data.features[item].properties.event); // gpc = get polygon colors
        alerts_data.features[item].properties.color = gpc.color;
        alerts_data.features[item].properties.priority = parseInt(gpc.priority);
    }
    alerts_data = _sort_by_priority(alerts_data);

    var index = 0;
    function _next() {
        index++;
        process_alert(index);
    }
    function process_alert(i) {
        console.log(i, alerts_data.features.length);
        if (i >= alerts_data.features.length) {
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
            return;
        };

        const this_feature = alerts_data.features[i];
        if (this_feature.geometry == null) {
            const affected_zones = this_feature.properties.affectedZones;
            // for (var x = 0; x < 10; x++) {
            //     fetch(affected_zones[x], {
            //         cache: 'no-store',
            //         // headers: headers
            //     })
            //     .then(response => response.json())
            //     .then(data => {
            //         // console.log(alerts_data.features[i].geometry);
            //         console.log(JSON.parse(JSON.stringify(alerts_data.features[i])))
            //         alerts_data.features[i].geometry = data.geometry;
            //         console.log(JSON.parse(JSON.stringify(alerts_data.features[i])))
            //         _next();
            //     })
            //     .catch((error) => {
            //         // console.error(`repeating ${i}`);
            //         // process_alert(i);
            //     });
            // }
            _next();
        } else {
            // console.log('already has geometry');
            _next();
        }
    }
    process_alert(index);

    // var duplicate_features = alerts_data.features.flatMap((element) => [element, element]);
    // duplicate_features = JSON.parse(JSON.stringify(duplicate_features));
    // for (var i = 0; i < duplicate_features.length; i++) {
    //     if (i % 2 === 0) {
    //         duplicate_features[i].properties.type = 'border';
    //     } else {
    //         duplicate_features[i].properties.type = 'outline';
    //     }
    // }
    // alerts_data.features = duplicate_features;

    // // console.log(alerts_data);
    // _add_alert_layers(alerts_data);
}

module.exports = plot_alerts;