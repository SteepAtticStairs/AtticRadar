const ut = require('../../core/utils');
const Hurricane = require('../Hurricane');
const kmz_to_geojson = require('../kmz_to_geojson');
const turf = require('@turf/turf');
const luxon = require('luxon');

var true_init_time;
function nhc_process_data() {
    // const nhc_storm_list_url = 'https://www.nrlmry.navy.mil/atcf_web/docs/current_storms/stormlist.current';
    const nhc_storm_list_url = 'https://www.nhc.noaa.gov/CurrentStorms.json';

    fetch(ut.phpProxy + nhc_storm_list_url, { headers: { 'Cache-Control': 'no-cache' } })
    .then(response => response.json())
    .then(json => {
        for (var i = 0; i < json.activeStorms.length; i++) {
            const current_storm = json.activeStorms[i].id.toUpperCase();
            true_init_time = luxon.DateTime.fromISO(json.activeStorms[i].lastUpdate, { zone: 'utc' });
            _nhc_fetch_cone(current_storm);
        }
        // const storms = text.split('\n').filter(n => n);
        // for (var i = 0; i < storms.length; i++) {
        //     const current_storm = storms[i];

        //     if (!current_storm.startsWith('WP')) {
        //         _nhc_fetch_cone(current_storm);
        //     }
        // }
    })
}

function _nhc_fetch_track(storm_id) {
    const track_url = `https://www.nhc.noaa.gov/storm_graphics/api/${storm_id.toUpperCase()}_TRACK_latest.kmz`;

    fetch(ut.phpProxy + track_url)
    .then(response => response.blob())
    .then(blob => {
        blob.lastModifiedDate = new Date();
        blob.name = track_url;

        kmz_to_geojson(blob, (geojson) => {
            console.log(geojson)
        })
    })
}

function _nhc_fetch_cone(storm_id) {
    const cone_url = `https://www.nhc.noaa.gov/storm_graphics/api/${storm_id.toUpperCase()}_CONE_latest.kmz`;

    fetch(ut.phpProxy + cone_url, { headers: { 'Cache-Control': 'no-cache' } })
    .then(response => response.blob())
    .then(blob => {
        blob.lastModifiedDate = new Date();
        blob.name = cone_url;

        kmz_to_geojson(blob, (geojson) => {
            const storm_name = geojson.features[0].properties.stormName
            const cone_geojson = turf.polygon(geojson.features[0].geometry.coordinates);

            // _nhc_fetch_track(storm_id);
            _nhc_process_forecast_data(storm_id, storm_name, cone_geojson);
        })
    })
}

function _nhc_process_forecast_data(storm_id, storm_name, cone_geojson) {
    const storm_forecast_url = `https://ftp.nhc.noaa.gov/atcf/fst/${storm_id.toLowerCase()}.fst`;

    fetch(ut.phpProxy + storm_forecast_url, { headers: { 'Cache-Control': 'no-cache' } })
    .then(response => response.text())
    .then(text => {
        const line_split = text.split('\n').filter(n => n);

        var points = [];
        var seen_hours = [];
        for (var i = 0; i < line_split.length; i++) {
            const current_line = line_split[i];
            const comma_split = current_line.split(',').filter(n => n).map((n) => n.trim());

            const init_time = comma_split[2];
            const fst_hour = parseInt(comma_split[5]);
            const lat = _format_degrees(comma_split[6]);
            const lon = _format_degrees(comma_split[7]);
            const knots = parseInt(comma_split[8]);
            const status = comma_split[10];

            var timestamp = luxon.DateTime.fromFormat(init_time, 'yyyyMMddHH', { zone: 'utc' });
            timestamp = timestamp.plus({ hours: fst_hour });
            // timestamp = timestamp.toLocal().toMillis();
            // timestamp = timestamp.toFormat('ccc LLL d h:mm a ZZZZ');

            // console.log(timestamp.toISO(), timestamp.hour, true_init_time.hour, true_init_time.toISO())
            if (timestamp >= true_init_time) {
                if (!seen_hours.includes(fst_hour)) {
                    seen_hours.push(fst_hour);

                    timestamp = timestamp.toLocal().toMillis();
                    points.push({
                        timestamp: timestamp,
                        lat: lat,
                        lon: lon,
                        knots: knots,
                        status: status
                    })
                }
            }
        }

        const storm = new Hurricane(storm_id, storm_name, points, cone_geojson);
        storm.plot();
    })
}

function _format_degrees(degree_string) {
    var degree_num = parseInt(degree_string) / 10;
    const direction = degree_string.slice(-1);

    if (direction == 'S' || direction == 'W') {
        degree_num = degree_num * -1;
    }

    return degree_num;
}

module.exports = nhc_process_data;