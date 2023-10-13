const ut = require('../core/utils');
const plot_alerts = require('./plot_alerts');
const pako = require('pako');
const combine_dictionary_data = require('./combine_dictionary_data');

const fetch_watches = require('./watches/watches');
const fetch_discussions = require('./discussions/discussions');

const url_prefix = 'https://atticradar.steepatticstairs.net/';

const new_alerts_url = `https://preview.weather.gov/edd/resource/edd/hazards/getShortFusedHazards.php?all=true`;
const sws_alerts_url = `https://preview.weather.gov/edd/resource/edd/hazards/getSps.php`;
// https://realearth.ssec.wisc.edu/products/?app=_ALL_
const all_alerts_url = `https://realearth.ssec.wisc.edu/api/shapes?products=NWS-Alerts-All`;
const noaa_alerts_url = `https://api.weather.gov/alerts/active`;

// previously, these were written as:
// "../app/alerts/zones/forecast_zones.js.gz"
// but that didn't work when pushed to github pages
const zone_urls = [
    `${url_prefix}app/alerts/zones/forecast_zones.js.gz`,
    `${url_prefix}app/alerts/zones/county_zones.js.gz`,
    `${url_prefix}app/alerts/zones/fire_zones.js.gz`,
];

var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');

function _fetch_alerts_data(callback) {
    fetch(noaa_alerts_url, {
        cache: 'no-store',
        // headers: headers
    })
    .then(response => response.json())
    .then(alerts_data => {
        fetch_watches();
        fetch_discussions();

        window.atticData.alerts_data = alerts_data;
        callback(alerts_data);
    })
}

var byte_length = 0;
function _fetch_zone_dictionaries(callback, index = 0) {
    fetch(zone_urls[index])
    .then(response => response.arrayBuffer())
    .then(buffer => {
        byte_length += buffer.byteLength;
        const inflated = pako.inflate(buffer, { to: 'string' });

        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.innerHTML = inflated;
        document.head.appendChild(s);

        if (index < zone_urls.length - 1) {
            _fetch_zone_dictionaries(callback, index + 1);
        } else {
            console.log(`Loaded alert zone dictionaries with a size length of ${ut.formatBytes(byte_length)}.`);
            callback();
        }
    })
}

function _fetch_data() {
    if (window.loaded_zones == undefined || window.loaded_zones == false) {
        window.loaded_zones = true;

        _fetch_alerts_data((alerts_data) => {
            plot_alerts(alerts_data);

            _fetch_zone_dictionaries(() => {
                const merged_geoJSON = combine_dictionary_data(alerts_data);
                map.getSource('alertsSource').setData(merged_geoJSON);
            });
        })
    } else {
        _fetch_alerts_data((alerts_data) => {
            const merged_geoJSON = combine_dictionary_data(alerts_data);
            map.getSource('alertsSource').setData(merged_geoJSON);
        })
    }
}

function return_data(callback) {
    fetch(noaa_alerts_url, {
        cache: 'no-store',
        // headers: headers
    })
    .then(response => response.json())
    .then(alerts_data => {
        fetch_watches();
        fetch_discussions();

        window.atticData.alerts_data = alerts_data;
        callback(alerts_data);
    })
}

module.exports = {
    _fetch_data,
    return_data
}