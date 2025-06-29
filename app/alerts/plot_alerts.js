const map = require('../core/map/map');
const get_polygon_colors = require('./colors/polygon_colors');
const turf = require('@turf/turf')

function _add_alert_layers(geojson) {
    // if the alerts have already been plotted to the map, calling _add_alert_layers just updates the existing data
    if (map.getSource('alerts_source')) {
        map.getSource('alerts_source').setData(geojson);
    } else {
        map.addSource('alerts_source', {
            type: 'geojson',
            data: geojson,
        })
        // if it's a zone alert, opacity is higher, otherwise for regular alerts it's zero
        map.addLayer({
            'id': 'alerts_layer_fill',
            'type': 'fill',
            'source': 'alerts_source',
            paint: {
                'fill-color': ['get', 'color'],
                'fill-opacity': [
                    'case',
                    ['==', ['get', 'is_zone'], true],
                    0.5,
                    0
                ]
            }
        });
        // if it's an outline alert, make it the alert's defined color
        // if it's a border alert, make it black and slightly thicker than the outline alerts
        // this gives the alerts the appearance of having a slight black border
        // however, if it's a zone alert, there's no border and the lines are skinny
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
                    ['==', ['get', 'is_zone'], true],
                    0.5,
                    ['==', ['get', 'type'], 'outline'],
                    2,
                    ['==', ['get', 'type'], 'border'],
                    5,
                    0
                ]
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
    const now = Date.now();
    // console.log(alerts_data);

    // finds the right colors for each alert, sometimes i want to have an override for the default color
    for (var item in alerts_data.features) {
        var gpc = get_polygon_colors(alerts_data.features[item].properties.event); // gpc = get polygon colors
        alerts_data.features[item].properties.color = gpc.color;
        alerts_data.features[item].properties.priority = parseInt(gpc.priority);
    }

    // stores ALL the zone polygons found, no matter the type
    const polygons = [];
    for (var i = 0; i < alerts_data.features.length; i++) {
        const this_feature = alerts_data.features[i];
        // make sure this is a zone alert
        if (this_feature.geometry == null) {
            // this is an array of all the zones for an alert (in url format), can be 1 or more
            const affected_zones = this_feature.properties.affectedZones;

            for (var x = 0; x < affected_zones.length; x++) {
                var zone_to_push;
                // we're replacing the urls to ONLY extract the zone's name
                if (affected_zones[x].includes('forecast')) {
                    const formatted = affected_zones[x].replace('https://api.weather.gov/zones/forecast/', '');
                    zone_to_push = forecast_zones[formatted];
                } else if (affected_zones[x].includes('county')) {
                    const formatted = affected_zones[x].replace('https://api.weather.gov/zones/county/', '');
                    zone_to_push = county_zones[formatted];
                } else if (affected_zones[x].includes('fire')) {
                    const formatted = affected_zones[x].replace('https://api.weather.gov/zones/fire/', '');
                    zone_to_push = fire_zones[formatted];
                }
                // make sure nothing went wrong with zone_to_push
                if (zone_to_push != undefined) {
                    // combine the zone coordinates with the alert properties
                    const polygon = turf.feature(zone_to_push.geometry, alerts_data.features[i].properties);
                    polygon.id = alerts_data.features[i].id;
                    polygon.properties.is_zone = true;
                    polygons.push(polygon);
                }
            }
        }
    }
    // combines the preexisting alerts_data.features (the non-zone alerts) with the zone alerts
    alerts_data.features = alerts_data.features.concat(polygons);

    // since non-zone alerts are plotted with a black border,
    // we need 2 separate instances of the alert for mapbox to plot separately,
    // so we duplicate the right alerts here
    // JSON.parse(JSON.stringify()) is necessary to truly duplicate the alerts without just referencing back
    var duplicate_features = [];
    alerts_data.features.forEach((element) => {
        // since zone alerts arent plotted with the border, we don't need to duplicate it,
        // but we still need to assign certain properties for mapbox to paint it right
        if (element.properties.is_zone == true) {
            var temp_outline_element = JSON.parse(JSON.stringify(element));
            temp_outline_element.properties.type = 'outline';
            duplicate_features.push(temp_outline_element);
        } else {
            var temp_border_element = JSON.parse(JSON.stringify(element));
            temp_border_element.properties.type = 'border';

            var temp_outline_element = JSON.parse(JSON.stringify(element));
            temp_outline_element.properties.type = 'outline';

            duplicate_features.push(temp_border_element, temp_outline_element);
        }
    });
    alerts_data.features = duplicate_features;

    // make sure that important alerts are plotted on top of lesser alerts
    alerts_data = _sort_by_priority(alerts_data);

    // console.log(alerts_data);
    _add_alert_layers(alerts_data);

    console.log(`Loaded alerts onto the map in ${Date.now() - now} ms`);
}

module.exports = plot_alerts;