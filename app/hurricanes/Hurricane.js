const turf = require('@turf/turf');
const ut = require('../core/utils');
const map = require('../core/map/map');

class Hurricane {
    constructor (storm_id, cone_coordinates, forecast_track_coordinates, forecast_point_coordinates, forecast_point_properties) {
        this._storm_id = storm_id;
        this._cone_coordinates = cone_coordinates;
        this._forecast_track_coordinates = forecast_track_coordinates;
        this._forecast_point_coordinates = forecast_point_coordinates;
        this._forecast_point_properties = forecast_point_properties;

        this._create_geojsons();
    }

    plot() {
        window.atticData.hurricane_layers = [];
        this._plot_cone();
        this._plot_forecast_track();
        this._plot_forecast_points();
    }

    _plot_forecast_points() {
        const source_name = `hurricane_forecast_points_${this._storm_id}_source`;
        const layer_name = `hurricane_forecast_points_${this._storm_id}_layer`;
        window.atticData.hurricane_layers.push(source_name, layer_name);

        map.addSource(source_name, {
            'type': 'geojson',
            'data': this.forecast_points
        })

        map.addLayer({
            'id': layer_name,
            'type': 'symbol',
            'source': source_name,
            'layout': {
                'icon-image': ['get', 'sshws_abbv'],
                'icon-size': 0.13,
                'symbol-sort-key': ['get', 'order'],

                // 'icon-allow-overlap': true,
                // 'icon-ignore-placement': true,
            }
        });

        map.on('mouseover', layer_name, function(e) {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseout', layer_name, function(e) {
            map.getCanvas().style.cursor = '';
        });

        // map.on('click', label_layer_name, _map_click);
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

            const sshws_value = ut.getSSHWSVal(ut.knotsToMph(properties.knots));
            properties.sshws_value = sshws_value[0];
            properties.sshws_abbv = sshws_value[2];
            properties.sshws_color = sshws_value[1];
            properties.coordinates = coords;

            points.push(turf.point(coords, properties));
        }
        points = points.filter(feature => feature.properties.sshws_value != undefined);

        // set the order for map symbol collision
        for (var i = 0; i < points.length; i++) {
            // points[i].properties.order = 1;
            // points[i].properties.order = points.length - i;
            points[i].properties.order = i;
        }
        // points[0].properties.order = 0;
        // points[points.length - 1].properties.order = 0;

        this.forecast_points = turf.featureCollection(points);
    }

    _create_geojsons() {
        this.cone = turf.polygon(this._cone_coordinates);
        this.forecast_track = turf.lineString(this._forecast_track_coordinates);
        this._format_points();
    }
}

module.exports = Hurricane;