const plot_alerts = require('./plot_alerts');

const noaa_alerts_url = `https://api.weather.gov/alerts/active`;

var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');

function fetch_data() {
    fetch(noaa_alerts_url, {
        cache: 'no-store',
        // headers: headers
    })
    .then(response => response.json())
    .then(alerts_data => {
        plot_alerts(alerts_data);
    })
}

module.exports = fetch_data;