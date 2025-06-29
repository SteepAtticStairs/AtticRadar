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
/**
 * Fetches the zone dictionaries and adds them as a script tag.
 */
function _fetch_zone_dictionaries(callback, index = 0) {
    const now = Date.now();
    // if we already loaded the zones then no need to fetch them again
    if (window.attic_data.loaded_zones) {
        callback();
        return;
    }
    fetch(zone_urls[index])
    .then(response => response.arrayBuffer())
    .then(buffer => {
        // keep track of how much data we're downloading for debugging
        byte_length += buffer.byteLength;
        // decompress the gzip data
        const inflated = pako.inflate(buffer, { to: 'string' });

        // add the searchable zone dictionaries as a script tag
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.innerHTML = inflated;
        document.head.appendChild(s);

        // check if we've finished loading all 3 dictionaries (forecast, county, fire)
        if (index < zone_urls.length - 1) {
            // we haven't finished, load the next one
            _fetch_zone_dictionaries(callback, index + 1);
        } else {
            // done
            console.log(`Loaded alert zone dictionaries with a size length of ${ut.formatBytes(byte_length)} in ${Date.now() - now} ms`);
            callback();
        }
    })
}

/**
 * This fetches the alerts file from the NWS that has all the realtime data.
 * However, it doesn't contain the coordinates for the zone alerts, it only says the zone's name,
 * which is why we need the coordinate dictionaries
 */
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

/**
 * Main file, just runs all the functions above
 */
function fetch_data() {
    _fetch_data_from_nws((alerts_data) => {
        _fetch_zone_dictionaries(() => {
            // store the fact that we've already fetched the data
            if (window.attic_data.loaded_zones == undefined || window.attic_data.loaded_zones == false) {
                window.attic_data.loaded_zones = true;
            }
            plot_alerts(alerts_data);
        })
    })
}

module.exports = fetch_data;