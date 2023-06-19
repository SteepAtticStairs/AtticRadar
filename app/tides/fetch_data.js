const plot_station_locations = require('./plot_station_locations');

function fetch_data() {
    const all_stations_url = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions';
    fetch(all_stations_url)
    .then(response => response.json())
    .then(json => {
        plot_station_locations(json);
    })
}

module.exports = fetch_data;