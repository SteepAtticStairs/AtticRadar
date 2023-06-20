const set_layer_order = require('../core/map/setLayerOrder');

const jtwc_fetch_data = require('./jtwc/jtwc_fetch_data');

const nhc_fetch_data = require('./nhc/nhc_fetch_data');
const nhc_plot_outlook = require('./nhc/nhc_plot_outlook');

const Hurricane = require('./Hurricane');

function init_hurricane_loading() {
    window.atticData.hurricane_layers = [];

    nhc_fetch_data((nhc_storage) => {
        const outlook_keys = Object.keys(nhc_storage.outlooks);
        for (var i = 0; i < outlook_keys.length; i++) {
            const id = outlook_keys[i];
            const kmz_blob = nhc_storage.outlooks[id].kmz;

            nhc_plot_outlook(kmz_blob, id);
        }

        const hurricane_keys = Object.keys(nhc_storage.hurricanes);
        for (var i = 0; i < hurricane_keys.length; i++) {
            const storm_id = hurricane_keys[i];
            const storm_name = nhc_storage.hurricanes[storm_id].name;
            const cone = nhc_storage.hurricanes[storm_id].cone;
            const forecast_track = nhc_storage.hurricanes[storm_id].forecast_track;
            const points = nhc_storage.hurricanes[storm_id].forecast_points;
            const point_properties = nhc_storage.hurricanes[storm_id].forecast_point_properties;

            const cyclone = new Hurricane(storm_id, storm_name, cone, forecast_track, points, point_properties);
            cyclone.plot();
            console.log(cyclone);
        }

        set_layer_order();
    });

    jtwc_fetch_data((jtwc_storage) => {
        const keys = Object.keys(jtwc_storage);
        for (var i = 0; i < keys.length; i++) {
            const storm_id = keys[i];
            const storm_name = jtwc_storage[storm_id].name;
            const cone = jtwc_storage[storm_id].cone;
            const forecast_track = jtwc_storage[storm_id].forecast_track;
            const points = jtwc_storage[storm_id].forecast_points;
            const point_properties = jtwc_storage[storm_id].forecast_point_properties;

            const cyclone = new Hurricane(storm_id, storm_name, cone, forecast_track, points, point_properties);
            cyclone.plot();
            console.log(cyclone);
        }

        set_layer_order();
    });
}

module.exports = init_hurricane_loading;