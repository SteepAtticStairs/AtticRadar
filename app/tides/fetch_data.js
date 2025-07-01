const plot_station_locations = require('./plot_station_locations');
const all_stations = require('./data/all_stations');

function fetch_data() {
    // const all_stations_url = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions';
    // fetch(all_stations_url)
    // .then(response => response.json())
    // .then(json => {
    //     plot_station_locations(json);
    // })
    plot_station_locations(all_stations);
}

module.exports = fetch_data;