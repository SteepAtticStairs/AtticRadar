const SurfaceFronts = require('./SurfaceFronts');
const plot_data = require('./plot_data');
const ut = require('../core/utils');

function _remove_empty_strings_from_array(array) {
    return array.filter(line => { return line.trim() != '' });
}

function fetch_data() {
    const hires_file_url = `https://tgftp.nws.noaa.gov/data/raw/as/asus02.kwbc.cod.sus.txt`;
    const lowres_file_url = `https://tgftp.nws.noaa.gov/data/raw/as/asus01.kwbc.cod.sus.txt`;

    fetch(ut.phpProxy + hires_file_url)
    .then(response => response.text())
    .then(data => {
        var formatted_lines = _remove_empty_strings_from_array(data.replaceAll('\r', '').split('\n'));
        formatted_lines = formatted_lines.join('\n');

        const fronts = new SurfaceFronts(formatted_lines);
        console.log(fronts);
        plot_data(fronts);
    })
}

module.exports = fetch_data;