const map = require('../core/map/map');
const ut = require('../core/utils');

function _map_click(e) {
    var coords = JSON.parse(e.features[0].properties.coordinates);
    if (coords.length == 3) {
        coords.pop();
    }

    new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000' })
        .setLngLat(coords)
        .setHTML(e.features[0].properties.description)
        .addTo(map);
}

class HurricanePlotter {
    constructor(master_storms_list) {
        this.master_storms_list = master_storms_list;

        window.atticData.hurricane_layers = [];
        this.plot_all_storms();
    }

    plot_all_storms() {
        const keys = Object.keys(this.master_storms_list.jtwc);
        for (var i = 0; i < keys.length; i++) {
            const current_storm = keys[i];

            this._plot_cone(current_storm);
            this._plot_forecast_track(current_storm);
            this._plot_forecast_points(current_storm);
        }
    }

    _plot_forecast_points(storm_id) {
        const forecast_points = this.master_storms_list.jtwc[storm_id].forecast_points;

        for (var i = 0; i < forecast_points.features.length; i++) {
            const name = forecast_points.features[i].properties.name;
            const matched = name.match(/(\d+\s*knots)/)[0];
            const knots = parseInt(matched.replaceAll(' knots', ''));

            const sshws_value = ut.getSSHWSVal(ut.knotsToMph(knots));
            forecast_points.features[i].properties.sshws_value = sshws_value[0];
            forecast_points.features[i].properties.sshws_abbv = sshws_value[2];
            forecast_points.features[i].properties.sshws_color = sshws_value[1];

            forecast_points.features[i].properties.coordinates = forecast_points.features[i].geometry.coordinates;
        }

        const layer_name = `forecast_points_${storm_id}_layer`;
        const label_layer_name = `forecast_points_label_${storm_id}_layer`;
        window.atticData.hurricane_layers.push(layer_name, label_layer_name);

        map.addLayer({
            'id': layer_name,
            'type': 'circle',
            'source': {
                'type': 'geojson',
                'data': forecast_points
            },
            'paint': {
                'circle-radius': 12,
                'circle-color': ['get', 'sshws_color'],
            }
        });
        map.addLayer({
            'id': label_layer_name,
            'type': 'symbol',
            'source': {
                'type': 'geojson',
                'data': forecast_points
            },
            'layout': {
                'text-field': ['get', 'sshws_abbv'],
                'text-font': [
                    'Arial Unicode MS Bold'
                ],
                'text-size': 14,
                'text-allow-overlap': true,
                'text-ignore-placement': true,
            }
        });

        map.on('mouseover', label_layer_name, function(e) {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseout', label_layer_name, function(e) {
            map.getCanvas().style.cursor = '';
        });

        // map.on('click', label_layer_name, _map_click);
    }

    _plot_forecast_track(storm_id) {
        const forecast_track = this.master_storms_list.jtwc[storm_id].forecast_track;

        const layer_name = `forecast_track_${storm_id}_layer`;
        window.atticData.hurricane_layers.push(layer_name);

        map.addLayer({
            'id': layer_name,
            'type': 'line',
            'source': {
                'type': 'geojson',
                'data': forecast_track
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

    _plot_cone(storm_id) {
        const cone = this.master_storms_list.jtwc[storm_id].cone;

        const source_name = `cone_${storm_id}_source`;
        const layer_name = `cone_${storm_id}_layer`;
        const outline_name = `cone_${storm_id}_outline`;
        window.atticData.hurricane_layers.push(source_name, layer_name, outline_name);

        map.addSource(source_name, {
            'type': 'geojson',
            'data': cone
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
}

module.exports = HurricanePlotter;