const ut = require('../core/utils');
const plot_alerts = require('./plot_alerts');
const pako = require('pako');

const new_alerts_url = `https://preview.weather.gov/edd/resource/edd/hazards/getShortFusedHazards.php?all=true`;
const sws_alerts_url = `https://preview.weather.gov/edd/resource/edd/hazards/getSps.php`;
// https://realearth.ssec.wisc.edu/products/?app=_ALL_
const all_alerts_url = `https://realearth.ssec.wisc.edu/api/shapes?products=NWS-Alerts-All`;
const noaa_alerts_url = `https://api.weather.gov/alerts/active`;

const zone_urls = [
    '../app/alerts/zones/forecast_zones.js.gz',
    '../app/alerts/zones/county_zones.js.gz',
    '../app/alerts/zones/fire_zones.js.gz',
];

var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');

function _fetch_alerts_data() {
    fetch(noaa_alerts_url, {
        cache: 'no-store',
        // headers: headers
    })
    .then(response => response.json())
    .then(alerts_data => {
        plot_alerts(alerts_data);
    })
}

function _fetch_zone_dictionaries(callback, index = 0) {
    fetch(zone_urls[index])
    .then(response => response.arrayBuffer())
    .then(buffer => {
        const inflated = pako.inflate(buffer, { to: 'string' });

        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.innerHTML = inflated;
        document.head.appendChild(s);

        if (index < zone_urls.length - 1) {
            _fetch_zone_dictionaries(callback, index + 1);
        } else {
            callback();
        }
    })
}

function _fetch_data() {
    if (window.loaded_zones == undefined || window.loaded_zones == false) {
        window.loaded_zones = true;

        _fetch_zone_dictionaries(() => {
            _fetch_alerts_data();
        })
    } else {
        _fetch_alerts_data();
    }
}

module.exports = {
    _fetch_data
}