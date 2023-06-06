const ut = require('../core/utils');
const urls = require('./urls');
const plot_data = require('./plot_data');

function fetch_spc_data() {
    fetch(ut.phpProxy + urls.convective.categorical.day1)
    .then(response => response.json())
    .then(json => {
        plot_data(json);
    })
}

module.exports = fetch_spc_data;