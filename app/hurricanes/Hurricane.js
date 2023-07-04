const turf = require('@turf/turf');
const ut = require('../core/utils');
const map = require('../core/map/map');
const set_layer_order = require('../core/map/setLayerOrder');

const custom_break = `<span style="display: block; margin-bottom: 0.5em;"></span>`;

function _click_listener(e) {
    const features = map.queryRenderedFeatures(e.point);
    if (features[0].layer.id != e.features[0].layer.id) { return; }

    const feature = e.features[0];
    const properties = feature.properties;

    const html_contents = 
`<div style="text-align: center">
<b style="color: ${properties.sshws_color}">${properties.sshws_value}
<br>
${properties.storm_name}</b>
<br>
<b>${ut.knotsToMph(properties.knots)}</b> mph
<br>
${custom_break}
${properties.day_of_week_abbv} ${properties.current_month_abbv} ${properties.day}<br>
${properties.formatted_hour}
</div>`

    new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000' })
        .setLngLat(JSON.parse(properties.coordinates))
        .setHTML(html_contents)
        .addTo(map);
}

/**
 * A class to store and plot hurricane information.
 * 
 * @param {String} storm_id - An ID associated with the storm. Has to be unique to each storm.
 * This is only used for differentiating between Mapbox layers.
 * @param {String} storm_name - The name of the storm, e.g. "Katrina", "Andrew", "Harvey"
 * @param {Array} cone_coordinates - A layered array of the cone's coordinates. Should be three layers, e.g.:
 * [ [ [0, 1], [0, 0], [1, 0], [1, 1], [0, 1] ] ]. The first and last coordinate pair must be the same.
 * @param {Array} forecast_track_coordinates - A 2D array of the cone's coordinates, e.g.:
 * [ [0, 0], [1, 1], [2, 2], [3, 3], [4, 4] ]
 * @param {Array} forecast_point_coordinates - Same format as "forecast_track_coordinates", but the coordinates for the forecast points
 * @param {*} forecast_point_properties - An array of objects, where each array item corresponds to a forecast point. The format of the objects should be as such: 
 * {
 *  coordinates: [-31, 47.9, 0],
 *  current_month_abbv: "Jul",
 *  day: 4,
 *  day_of_week_abbv: "Tue",
 *  formatted_hour: "12:00 PM EDT",
 *  knots: 56.47263249348393,
 *  sshws_abbv: "TS",
 *  sshws_border_color: "#009a11",
 *  sshws_border_width: 2,
 *  sshws_color: "rgb(18, 204, 71)",
 *  sshws_value: "Tropical Storm",
 *  storm_name: "Danielle",
 *  time : "12Z"
 * }
 */
class Hurricane {
    constructor (storm_id, storm_name, cone_coordinates, forecast_track_coordinates, forecast_point_coordinates, forecast_point_properties) {
        this._storm_id = storm_id;
        this._storm_name = storm_name;
        this._cone_coordinates = cone_coordinates;
        this._forecast_track_coordinates = forecast_track_coordinates;
        this._forecast_point_coordinates = forecast_point_coordinates;
        this._forecast_point_properties = forecast_point_properties;

        this._create_geojsons();
    }

    plot() {
        this._plot_cone();
        this._plot_forecast_track();
        this._plot_forecast_points();

        set_layer_order();
    }

    _plot_forecast_points() {
        const source_name = `hurricane_forecast_points_${this._storm_id}_source`;
        const layer_name = `hurricane_forecast_points_${this._storm_id}_layer`;
        // const label_layer_name = `hurricane_forecast_points_label_${this._storm_id}_layer`;
        window.atticData.hurricane_layers.push(source_name, layer_name);

        map.addSource(source_name, {
            'type': 'geojson',
            'data': this.forecast_points
        })

        map.addLayer({
            'id': layer_name,
            'type': 'circle',
            'source': source_name,
            'paint': {
                'circle-radius': 6,
                'circle-color': ['get', 'sshws_color'],

                'circle-stroke-width': ['get', 'sshws_border_width'],
                'circle-stroke-color': ['get', 'sshws_border_color']
            }
        });

        map.on('mouseover', layer_name, function(e) {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseout', layer_name, function(e) {
            map.getCanvas().style.cursor = '';
        });

        map.on('click', layer_name, _click_listener);
    }

    _plot_forecast_track() {
        const layer_name = `hurricane_forecast_track_${this._storm_id}_layer`;
        window.atticData.hurricane_layers.push(layer_name);

        map.addLayer({
            'id': layer_name,
            'type': 'line',
            'source': {
                'type': 'geojson',
                'data': this.forecast_track
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
    }

    _plot_cone() {
        const source_name = `hurricane_cone_${this._storm_id}_source`;
        const layer_name = `hurricane_cone_${this._storm_id}_layer`;
        const outline_name = `hurricane_cone_${this._storm_id}_outline`;
        window.atticData.hurricane_layers.push(source_name, layer_name, outline_name);

        map.addSource(source_name, {
            'type': 'geojson',
            'data': this.cone
        })

        map.addLayer({
            'id': layer_name,
            'type': 'fill',
            'source': source_name,
            'paint': {
                'fill-color': 'rgb(175, 175, 175)',
                'fill-opacity': 0.25
            }
        });
        map.addLayer({
            'id': outline_name,
            'type': 'line',
            'source': source_name,
            'paint': {
                'line-color': 'rgb(100, 100, 100)',
                'line-width': 3
            }
        });
    }

    _format_points() {
        var points = [];
        for (var i = 0; i < this._forecast_point_coordinates.length; i++) {
            const coords = this._forecast_point_coordinates[i];
            const properties = this._forecast_point_properties[i];

            points.push(turf.point(coords, properties));
        }
        points = points.filter(feature => feature.properties.sshws_value != undefined);
        this.forecast_points = turf.featureCollection(points);
    }

    _create_geojsons() {
        this.cone = turf.polygon(this._cone_coordinates);

        const coords = this._forecast_track_coordinates;
        if (coords.length == 1) {
            this._forecast_track_coordinates = [coords, coords];
        }
        this.forecast_track = turf.lineString(this._forecast_track_coordinates);
        this._format_points();
    }
}

module.exports = Hurricane;