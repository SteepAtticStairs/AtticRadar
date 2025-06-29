const plot_alerts = require('./plot_alerts');
const ut = require('../core/utils');
const pako = require('pako');

const noaa_alerts_url = `https://api.weather.gov/alerts/active`;

const url_prefix = 'https://atticradar.steepatticstairs.net/';

// previously, these were written as:
// "../../app/alerts/zones/forecast_zones.js.gz"
// but that didn't work when pushed to github pages
const zone_urls = [
    `${url_prefix}app/alerts/zones/forecast_zones.js.gz`,
    `${url_prefix}app/alerts/zones/county_zones.js.gz`,
    `${url_prefix}app/alerts/zones/fire_zones.js.gz`,
];

var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');

var byte_length = 0;
function _fetch_zone_dictionaries(callback, index = 0) {
    const now = Date.now();
    if (window.attic_data.loaded_zones) {
        callback();
        return;
    }
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
            console.log(`Loaded alert zone dictionaries with a size length of ${ut.formatBytes(byte_length)} in ${Date.now() - now} ms`);
            callback();
        }
    })
}

function _fetch_data_from_nws(callback) {
    const now = Date.now();
    fetch(noaa_alerts_url, {
        cache: 'no-store',
        // headers: headers
    })
    .then(response => response.json())
    .then(alerts_data => {
        console.log(`Fetched alert data from the NWS in ${Date.now() - now} ms`);
        callback(alerts_data);
    })
}

function fetch_data() {
    _fetch_data_from_nws((alerts_data) => {
        _fetch_zone_dictionaries(() => {
            if (window.attic_data.loaded_zones == undefined || window.attic_data.loaded_zones == false) {
                window.attic_data.loaded_zones = true;
            }
            plot_alerts(alerts_data);
        })
    })
}

module.exports = fetch_data;