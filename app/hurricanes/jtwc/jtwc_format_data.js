const kmz_to_geojson = require('../kmz_to_geojson');

function _parse_kmz(jtwc_storage, callback) {
    const keys = Object.keys(jtwc_storage);

    function _parse_all_kmz(cb, index = 0) {
        const kmz_blob = jtwc_storage[keys[index]].kmz;
        kmz_to_geojson(kmz_blob, (geojson) => {
            jtwc_storage[keys[index]].geojson = geojson;

            if (index < keys.length - 1) {
                _parse_all_kmz(cb, index + 1);
            } else {
                cb(jtwc_storage);
            }
        })
    }

    _parse_all_kmz(() => {
        callback(jtwc_storage);
    });
}

function _grab_cone_track_points(jtwc_storage) {
    const keys = Object.keys(jtwc_storage);
    for (var i = 0; i < keys.length; i++) {
        const current_storm = keys[i];
        const geojson = jtwc_storage[current_storm].geojson;

        const points = [];
        const point_properties = [];
        for (var n = 0; n < geojson.features.length; n++) {
            const name = geojson.features[n].properties.name;
            const type = geojson.features[n].geometry.type;

            if (type == 'Point') {
                const properties = geojson.features[n].properties;
                const name = properties.name;
                const matched = name.match(/(\d+\s*knots)/)?.[0];
                if (matched) {
                    const this_point_properties = {};

                    const knots = parseInt(matched.replaceAll(' knots', ''));
                    this_point_properties.knots = knots;
                    point_properties.push(this_point_properties);

                    points.push(geojson.features[n].geometry.coordinates);
                }
            }

            if (name == '34 knot Danger Swath') {
                jtwc_storage[current_storm].cone = geojson.features[n].geometry.coordinates;
            } else if (name.includes('Storm Track')) {
                jtwc_storage[current_storm].forecast_track = geojson.features[n].geometry.coordinates;
            }
        }
        jtwc_storage[current_storm].forecast_points = points;
        jtwc_storage[current_storm].forecast_point_properties = point_properties;
    }
    return jtwc_storage;
}

function jtwc_format_data(jtwc_storage, callback) {
    _parse_kmz(jtwc_storage, (jtwc_storage) => {
        jtwc_storage = _grab_cone_track_points(jtwc_storage);
        callback(jtwc_storage);
    })
}

module.exports = jtwc_format_data;