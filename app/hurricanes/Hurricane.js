const map = require('../core/map/map');
const ut = require('../core/utils');
const icons = require('../core/map/icons/icons');

const turf = require('@turf/turf');
const chroma = require('chroma-js');
const luxon = require('luxon');

const custom_break = `<span style="display: block; margin-bottom: 0.5em;"></span>`;

// https://stackoverflow.com/a/58147484/18758797
const round_to_nearest_5 = x => Math.round(x / 5) * 5

function _click_listener(e) {
    const features = map.queryRenderedFeatures(e.point);
    if (features[0].layer.id != e.features[0].layer.id) { return; }

    const feature = e.features[0];
    const properties = feature.properties;

    const date = luxon.DateTime.fromMillis(properties.timestamp, { zone: 'utc' }).toLocal();
    const date_first_line = date.toFormat('ccc LLL d');
    const date_second_line = date.toFormat('h:mm a ZZZZ');

    const html_contents = 
`<div style="text-align: center">
<b style="color: ${properties.color}">${properties.sshws_value}
<br>
${properties.storm_name}</b>
<br>
<b>${round_to_nearest_5(ut.knotsToMph(properties.knots))}</b> mph
<br>
${custom_break}
${date_first_line}<br>
${date_second_line}
</div>`

    new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000' })
        .setLngLat([properties.lon, properties.lat])
        .setHTML(html_contents)
        .addTo(map);
}

class Hurricane {
    constructor (storm_id, storm_name, forecast_points, cone_geojson) {
        this.storm_id = storm_id;
        this.storm_name = storm_name;
        this.cone_geojson = cone_geojson;
        this._forecast_points = forecast_points;
    }

    plot() {
        if (this._forecast_points.length == 0) {
            console.error('Empty data - cannot plot hurricane.');
        } else {
            this._create_points_geojson();
            this._create_line_geojson();
            // this._create_current_point_geojson();

            const cone_source_name = `hurricane_cone_${this.storm_id}_source`;
            const cone_layer_name = `hurricane_cone_${this.storm_id}_layer`;
            const cone_outline_name = `hurricane_cone_${this.storm_id}_outline`;
            window.atticData.hurricane_layers.push(cone_source_name, cone_layer_name, cone_outline_name);
            map.addSource(cone_source_name, {
                'type': 'geojson',
                'data': this.cone_geojson
            })
            map.addLayer({
                'id': cone_layer_name,
                'type': 'fill',
                'source': cone_source_name,
                'paint': {
                    'fill-color': 'rgb(175, 175, 175)',
                    'fill-opacity': 0.25
                }
            });
            map.addLayer({
                'id': cone_outline_name,
                'type': 'line',
                'source': cone_source_name,
                'paint': {
                    'line-color': 'rgb(100, 100, 100)',
                    'line-width': 3
                }
            });

            const forecast_line_layer_name = `hurricane_forecast_track_${this.storm_id}_layer`;
            window.atticData.hurricane_layers.push(forecast_line_layer_name);
            map.addLayer({
                'id': forecast_line_layer_name,
                'type': 'line',
                'source': {
                    'type': 'geojson',
                    'data': this.forecast_line
                },
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': ['get', 'color'], // #888
                    'line-width': 4 // 5
                }
            });

            const forecast_points_source_name = `hurricane_forecast_points_${this.storm_id}_source`;
            const forecast_points_layer_name = `hurricane_forecast_points_${this.storm_id}_layer`;
            window.atticData.hurricane_layers.push(forecast_points_source_name, forecast_points_layer_name);
            map.addSource(forecast_points_source_name, {
                'type': 'geojson',
                'data': this.forecast_points
            })
            map.addLayer({
                'id': forecast_points_layer_name,
                'type': 'circle',
                'source': forecast_points_source_name,
                'paint': {
                    'circle-radius': 6,
                    'circle-color': ['get', 'color'],

                    'circle-stroke-width': 2, // ['get', 'sshws_border_width'],
                    'circle-stroke-color': ['get', 'border_color']
                }
            });

            const current_point_layer_name = `hurricane_current_point_${this.storm_id}_layer`;
            window.atticData.hurricane_layers.push(current_point_layer_name);
            icons.add_icon_svg([
                [icons.icons.hurricane_TD, 'hurricane_TD'],
                [icons.icons.hurricane_TS, 'hurricane_TS'],
                [icons.icons.hurricane_C1, 'hurricane_C1'],
                [icons.icons.hurricane_C2, 'hurricane_C2'],
                [icons.icons.hurricane_C3, 'hurricane_C3'],
                [icons.icons.hurricane_C4, 'hurricane_C4'],
                [icons.icons.hurricane_C5, 'hurricane_C5'],
                [icons.icons.hurricane_OTHER, 'hurricane_OTHER'],
                [icons.icons.hurricane_UNKNOWN, 'hurricane_UNKNOWN'],
                [icons.icons.hurricane_NONTROPICAL, 'hurricane_NONTROPICAL']
            ], () => {
                map.addLayer({
                    'id': current_point_layer_name,
                    'type': 'symbol',
                    'source': {
                        'type': 'geojson',
                        'data': this.current_point
                    },
                    'layout': {
                        'icon-image': ['get', 'icon_abbv'],
                        'icon-size': 0.175
                    }
                    // 'paint': {
                    //     // 'circle-radius': 5,
                    //     // 'circle-color': ['get', 'color'],

                    //     // 'circle-stroke-width': 5,
                    //     // 'circle-stroke-color': ['get', 'border_color']
                    // }
                });

                map.on('mouseover', forecast_points_layer_name, function(e) { map.getCanvas().style.cursor = 'pointer'; });
                map.on('mouseout', forecast_points_layer_name, function(e) { map.getCanvas().style.cursor = ''; });
                map.on('click', forecast_points_layer_name, _click_listener);

                map.on('mouseover', current_point_layer_name, function(e) { map.getCanvas().style.cursor = 'pointer'; });
                map.on('mouseout', current_point_layer_name, function(e) { map.getCanvas().style.cursor = ''; });
                map.on('click', current_point_layer_name, _click_listener);
            })
        }
    }

    _create_points_geojson() {
        var points = [];
        for (var i = 0; i < this._forecast_points.length; i++) {
            const properties = this._forecast_points[i];
            const coords = [properties.lon, properties.lat];

            const sshws_value = ut.getSSHWSVal(properties.knots * 1.151);
            if (!['HU', 'TS'].includes(properties.status)) {
                properties.color = ut.getSSHWSVal('Non-Tropical')[1];
                properties.icon_abbv = `hurricane_${ut.getSSHWSVal('Non-Tropical')[2]}`;
                properties.sshws_value = ut.hurricaneTypesAbbvs[properties.status];
            } else {
                properties.color = sshws_value[1];
                properties.icon_abbv = `hurricane_${sshws_value[2]}`;
                properties.sshws_value = sshws_value[0];
            }
            properties.storm_name = this.storm_name;
            properties.border_color = chroma(properties.color).darken().hex();

            points.push(turf.point(coords, properties));
        }
        this.forecast_points = turf.featureCollection(points);
    }

    _create_line_geojson() {
        var lines = [];
        for (var i = 0; i < this._forecast_points.length; i++) {
            const properties = this._forecast_points[i];
            const coords = [properties.lon, properties.lat];
            const next_coords = [this._forecast_points[i + 1]?.lon, this._forecast_points[i + 1]?.lat];

            if (next_coords[0] != undefined) {
                lines.push(turf.lineString([coords, next_coords], { color: properties.color }));
            }
        }
        this.forecast_line = turf.featureCollection(lines);
    }

    _create_current_point_geojson() {
        const now = luxon.DateTime.now().toMillis();
        var timestamps = [];
        for (var i = 0; i < this._forecast_points.length; i++) {
            timestamps.push(this._forecast_points[i].timestamp);
        }
        const closest = detect_close(now, timestamps);
        const closest_higher = closest[0];
        const closest_lower = closest[1];

        const percent_along = ut.scale(now, closest_lower, closest_higher, 0, 100);

        var higher_properties;
        var lower_properties;
        for (var i = 0; i < this._forecast_points.length; i++) {
            if (this._forecast_points[i].timestamp == closest_higher) {
                higher_properties = this._forecast_points[i];
            } else if (this._forecast_points[i].timestamp == closest_lower) {
                lower_properties = this._forecast_points[i];
            }
        }
        const higher_coords = [higher_properties.lon, higher_properties.lat];
        const lower_coords = [lower_properties.lon, lower_properties.lat];
        const distance = turf.distance(higher_coords, lower_coords);
        this.current_point = turf.along(turf.lineString([lower_coords, higher_coords]), distance * (percent_along / 100));
        // this.current_point = turf.midpoint([higher_properties.lon, higher_properties.lat], [lower_properties.lon, lower_properties.lat]);

        this.current_point.properties = JSON.parse(JSON.stringify(higher_properties));
        this.current_point.properties.timestamp = now;
        this.current_point.properties.lon = this.current_point.geometry.coordinates[0];
        this.current_point.properties.lat = this.current_point.geometry.coordinates[1];
    }
}

// https://stackoverflow.com/a/72380408/18758797
const detect_close = (x, array) => {
    // if has x, just return an array with x;
    if (array.includes(x)) {
        return [x];
    }
    // if array has less or equal 2 elements, no further verification needed
    if (array.length <= 2) {
        return array;
    }
    // function to sort array elements by its absolute distance to 'x'
    const sort = (sortArray) => sortArray.sort((a, b) => {
        return Math.abs(a - x) > Math.abs(b - x) ? 1 : -1;
    });
    // gets the numbers to the right, ordered by distance to x
    const higher = sort(array.filter((i) => i > x));
    // gets numbers to the left, ordered by distance to x
    const lower = sort(array.filter((i) => i < x));

    // no higher number? results will come from the left.
    if (higher.length === 0) {
        return [lower[1], lower[0]];
    }

    // if no lower numbers, results must come from the right
    if (lower.length === 0) {
        return [higher[0], higher[1]];
    }

    // it has numbers left or right, return the closest in each array
    return [lower[0], higher[0]];
};

module.exports = Hurricane;