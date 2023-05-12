const ut = require('../radar/utils');
const plot_alerts = require('./plot_alerts');

const new_alerts_url = `https://preview.weather.gov/edd/resource/edd/hazards/getShortFusedHazards.php?all=true`;
const sws_alerts_url = `https://preview.weather.gov/edd/resource/edd/hazards/getSps.php`;
// https://realearth.ssec.wisc.edu/products/?app=_ALL_
const all_alerts_url = `https://realearth.ssec.wisc.edu/api/shapes?products=NWS-Alerts-All`;
const noaa_alerts_url = `https://api.weather.gov/alerts/active`;

var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');

function _fetch_data() {
    fetch(noaa_alerts_url, {
        cache: 'no-store',
        // headers: headers
    })
    .then((response) => response.json())
    .then((alerts_data) => {
        plot_alerts(alerts_data);
    })
}

module.exports = {
    _fetch_data
}