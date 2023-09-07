const map = require('../core/map/map');
const ut = require('../core/utils');

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
                    'data': this.line_string
                },
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#888',
                    'line-width': 5
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

            map.on('mouseover', forecast_points_layer_name, function(e) {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseout', forecast_points_layer_name, function(e) {
                map.getCanvas().style.cursor = '';
            });
            map.on('click', forecast_points_layer_name, _click_listener);
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
                properties.sshws_value = ut.hurricaneTypesAbbvs[properties.status];
            } else {
                properties.color = sshws_value[1];
                properties.sshws_value = sshws_value[0];
            }
            properties.storm_name = this.storm_name;
            properties.border_color = chroma(properties.color).darken().hex();

            points.push(turf.point(coords, properties));
        }
        this.forecast_points = turf.featureCollection(points);
    }

    _create_line_geojson() {
        var points = [];
        for (var i = 0; i < this._forecast_points.length; i++) {
            const properties = this._forecast_points[i];
            const coords = [properties.lon, properties.lat];
            points.push(coords);
        }
        this.line_string = turf.lineString(points);
    }
}

module.exports = Hurricane;