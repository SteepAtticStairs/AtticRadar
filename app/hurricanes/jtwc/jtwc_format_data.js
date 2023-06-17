const kmz_to_geojson = require('../kmz_to_geojson');
const luxon = require('luxon');

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

        var last_day_seen = null;
        var month_look_index = 0;
        const points = [];
        const point_properties = [];
        for (var n = 0; n < geojson.features.length; n++) {
            const name = geojson.features[n].properties.name;
            const type = geojson.features[n].geometry.type;

            if (type == 'Point') {
                const properties = geojson.features[n].properties;
                const name = properties.name;
                const date = name.split(' ')[0];
                const matched = name.match(/(\d+\s*knots)/)?.[0];
                if (matched) {
                    const this_point_properties = {};

                    const knots = parseInt(matched.replaceAll(' knots', ''));
                    this_point_properties.knots = knots;
                    point_properties.push(this_point_properties);

                    const date_split = date.split('/');
                    const day = parseInt(date_split[0]);
                    const time = date_split[1];

                    // this is just a simple check to see if there is month crossing
                    if (last_day_seen == null) last_day_seen = day;
                    if (last_day_seen > day) {
                        month_look_index++;
                    }
                    last_day_seen = day;

                    const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    const month_num = new Date().getMonth() + month_look_index;
                    const current_month_abbv = month_names[month_num].slice(0, 3);
                    // const current_month_abbv = new Date().toLocaleString('default', { month: 'long' }).slice(0, 3);

                    // const datetime = luxon.DateTime.fromFormat(`${month_num}, ${day}, ${time}`, "M, d, HH'Z'");
                    const now = luxon.DateTime.now();
                    const datetime = luxon.DateTime.utc(now.year, month_num, day, parseInt(time.slice(0, -1))).toLocal();
                    const formatted_hour = datetime.toFormat('h:mm a ZZZZ');

                    this_point_properties.current_month_abbv = current_month_abbv;
                    this_point_properties.day = day;
                    this_point_properties.time = time;
                    this_point_properties.formatted_hour = formatted_hour;

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