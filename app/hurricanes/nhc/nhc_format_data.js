const kmz_to_geojson = require('../kmz_to_geojson');
const ut = require('../../core/utils');
const luxon = require('luxon');
const chroma = require('chroma-js');

function _parse_kmz(nhc_storage, callback) {
    const keys = Object.keys(nhc_storage.hurricanes);
    if (keys.length == 0) {
        callback(nhc_storage);
    } else {
        function _parse_all_kmz(cb, index = 0) {
            const cone_kmz_blob = nhc_storage.hurricanes[keys[index]].cone_kmz;
            const track_kmz_blob = nhc_storage.hurricanes[keys[index]].track_kmz;

            kmz_to_geojson(cone_kmz_blob, (geojson) => {
                nhc_storage.hurricanes[keys[index]].cone_geojson = geojson;

                kmz_to_geojson(track_kmz_blob, (geojson) => {
                    nhc_storage.hurricanes[keys[index]].track_geojson = geojson;

                    if (index < keys.length - 1) {
                        _parse_all_kmz(cb, index + 1);
                    } else {
                        cb(nhc_storage);
                    }
                })
            })
        }

        _parse_all_kmz(() => {
            callback(nhc_storage);
        });
    }
}

function _grab_cone_track_points(nhc_storage) {
    const points = [];
    const point_properties = [];
    var first_date;

    const keys = Object.keys(nhc_storage.hurricanes);
    for (var i = 0; i < keys.length; i++) {
        const current_storm = keys[i];
        const cone_geojson = nhc_storage.hurricanes[current_storm].cone_geojson;
        const track_geojson = nhc_storage.hurricanes[current_storm].track_geojson;

        // console.log(track_geojson);

        nhc_storage.hurricanes[current_storm].cone = cone_geojson.features[0].geometry.coordinates;
        nhc_storage.hurricanes[current_storm].forecast_track = track_geojson.features[1].geometry.coordinates;

        for (var n = 2; n < track_geojson.features.length; n++) {
            points.push(track_geojson.features[n].geometry.coordinates);

            const this_point_properties = {};
            const properties = track_geojson.features[n].properties;

            this_point_properties.storm_name = nhc_storage.hurricanes[current_storm].name;

            // parse the content of each point
            const div = document.createElement('div');
            div.innerHTML = properties.description;
            const parsed_description = JSON.parse(ut.html2json(div));

            const storm_type = parsed_description.children[0].children[0].children[0].textContent;
            const storm_type_regex = /^(.*?)\s+\([A-Z]+\d+\)$/;
            const parsed_storm_type = storm_type.replace(this_point_properties.storm_name, '').match(storm_type_regex)[1];
            this_point_properties.sshws_value = parsed_storm_type;

            const max_wind = parsed_description.children[0].children[0].children[6].textContent;
            // gets text in between parentheses, e.g. "70 mph" and removes the last 4 characters
            // https://stackoverflow.com/a/12059321/18758797
            const max_wind_mph = max_wind.match(/\(([^)]+)\)/)[1].slice(0, -4);
            this_point_properties.knots = parseInt(max_wind_mph) / 1.151; // mph to knots

            // Valid at: 4:00 PM EST November 07, 2022
            const time = parsed_description.children[0].children[0].children[4].textContent;
            const formatted_date = time.replace('Valid at:', '').replace(',', '').trim().split(/\s|:/).filter(n => n);
            // ['1', '00', 'PM', 'EST', 'November', '12', '2022']
            const pdp = {}; // pdp = provided date parts
            pdp.hour = formatted_date[0];
            pdp.minutes = formatted_date[1];
            pdp.meridiem = formatted_date[2];
            pdp.tzAbbv = formatted_date[3];
            pdp.month = formatted_date[4];
            pdp.day = formatted_date[5];
            pdp.year = formatted_date[6];
            const combined_parts = `${ut.zeroPad(pdp.hour)}:${ut.zeroPad(pdp.minutes)} ${pdp.meridiem} ${pdp.month} ${ut.zeroPad(pdp.day)} ${pdp.year} UTC`;
            const utc_date_time = luxon.DateTime.fromFormat(combined_parts, 'hh:mm a LLLL dd yyyy z').setZone('UTC');

            var elapsed_hours;
            if (first_date == undefined) {
                first_date = utc_date_time;
                elapsed_hours = 0;
            } else {
                var diff = utc_date_time.diff(first_date, ['hours']);
                elapsed_hours = diff.hours;
            }

            var tz_abbv, luxon_tz;
            var local_time = true;
            if (local_time) {
                tz_abbv = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];
                luxon_tz = 'system'; // America/New_York
            } else {
                tz_abbv = 'UTC';
                luxon_tz = 'UTC';
            }

            var formatted_date_obj = luxon.DateTime.fromISO(nhc_storage.hurricanes[current_storm].last_update).setZone(luxon_tz);
            formatted_date_obj = formatted_date_obj.plus({ hours: elapsed_hours });

            this_point_properties.day_of_week_abbv = formatted_date_obj.toFormat('ccc');
            this_point_properties.current_month_abbv = formatted_date_obj.toFormat('LLL');
            this_point_properties.day = parseInt(formatted_date_obj.toFormat('d'));
            this_point_properties.time = formatted_date_obj.toFormat(`HH'Z'`);
            this_point_properties.formatted_hour = formatted_date_obj.toFormat('h:mm a ZZZZ');

            const sshws_value = ut.getSSHWSVal(ut.knotsToMph(this_point_properties.knots));
            // this_point_properties.sshws_value = sshws_value[0];
            this_point_properties.sshws_abbv = sshws_value[2];
            this_point_properties.sshws_color = sshws_value[1];
            this_point_properties.coordinates = track_geojson.features[n].geometry.coordinates;

            this_point_properties.sshws_border_color = chroma(this_point_properties.sshws_color).darken().hex();
            this_point_properties.sshws_border_width = 2;

            point_properties.push(this_point_properties);
        }

        nhc_storage.hurricanes[current_storm].forecast_points = points;
        nhc_storage.hurricanes[current_storm].forecast_point_properties = point_properties;
    }
    return nhc_storage;
}

function nhc_format_data(nhc_storage, callback) {
    _parse_kmz(nhc_storage, (nhc_storage) => {
        nhc_storage = _grab_cone_track_points(nhc_storage);
        callback(nhc_storage);
    })
}

module.exports = nhc_format_data;