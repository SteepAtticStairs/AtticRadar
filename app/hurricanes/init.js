const jtwc_fetch_data = require('./jtwc/jtwc_fetch_data');
const Hurricane = require('./Hurricane');

function init_hurricane_loading() {
    jtwc_fetch_data((jtwc_storage) => {
        window.atticData.hurricane_layers = [];

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
    });
}

module.exports = init_hurricane_loading;