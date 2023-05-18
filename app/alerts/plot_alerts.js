const get_polygon_colors = require('./colors/polygon_colors');
const set_layer_order = require('../core/map/setLayerOrder');
const click_listener = require('./click_listener');
const filter_alerts = require('./filter_alerts');
const geojsonMerge = require('@mapbox/geojson-merge');
const map = require('../core/map/map');

function _add_alert_layers(geojson) {
    if (map.getSource('alertsSource')) {
        map.getSource('alertsSource').setData(geojson);
    } else {
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
}

function _combine_dictionary_data(alerts_data) {
    var polygonGeojson = {
        "type": "FeatureCollection",
        "features": []
    }
    function pushNewPolygon(geometry, properties) {
        // this allows you to add properties for each cell
        var objToPush = {
            "type": "Feature",
            "geometry": geometry,
            "properties": properties
        }
        polygonGeojson.features.push(objToPush)
    }
    for (var item in alerts_data.features) {
        if (alerts_data.features[item].geometry == null) {
            var affectedZones = alerts_data.features[item].properties.affectedZones;
            for (var i in affectedZones) {
                var zoneToPush;
                if (affectedZones[i].includes('forecast')) {
                    affectedZones[i] = affectedZones[i].replace('https://api.weather.gov/zones/forecast/', '');
                    zoneToPush = forecast_zones[affectedZones[i]];
                } else if (affectedZones[i].includes('county')) {
                    affectedZones[i] = affectedZones[i].replace('https://api.weather.gov/zones/county/', '');
                    zoneToPush = county_zones[affectedZones[i]];
                } else if (affectedZones[i].includes('fire')) {
                    affectedZones[i] = affectedZones[i].replace('https://api.weather.gov/zones/fire/', '');
                    zoneToPush = fire_zones[affectedZones[i]];
                }
                if (zoneToPush != undefined) {
                    pushNewPolygon(zoneToPush.geometry, alerts_data.features[item].properties);
                }
            }
        }
    }
    var merged_geoJSON = geojsonMerge.merge([
        polygonGeojson,
        alerts_data
    ]);
    return merged_geoJSON;
}

function _sort_by_priority(data) {
    data.features = data.features.sort((a, b) => b.properties.priority - a.properties.priority);
    return data;
}

function plot_alerts(alerts_data) {
    for (var item in alerts_data.features) {
        var gpc = get_polygon_colors(alerts_data.features[item].properties.event); // gpc = get polygon colors
        alerts_data.features[item].properties.color = gpc.color;
        alerts_data.features[item].properties.priority = parseInt(gpc.priority);
    }
    alerts_data = _sort_by_priority(alerts_data);
    alerts_data = filter_alerts(alerts_data);
    console.log(alerts_data);

    _add_alert_layers(alerts_data);

    // const merged_geoJSON = _combine_dictionary_data(alerts_data);
    // map.getSource('alertsSource').setData(merged_geoJSON);

    set_layer_order();
}

module.exports = plot_alerts;