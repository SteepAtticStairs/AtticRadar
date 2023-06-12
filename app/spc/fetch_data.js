const ut = require('../core/utils');
const urls = require('./urls');
const plot_data = require('./plot_data');

function fetch_spc_data(type, category, day) {
    fetch(ut.phpProxy + urls[type][category][day])
    .then(response => response.json())
    .then(json => {
        plot_data(json);
    })
}

module.exports = fetch_spc_data;