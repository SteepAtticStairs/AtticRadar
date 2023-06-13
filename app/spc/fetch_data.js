const ut = require('../core/utils');
const urls = require('./urls');
const plot_data = require('./plot_data');
const fix_geojson_layering = require('./fix_geojson_layering');

function fetch_spc_data(type, category, day) {
    function capitalize_first_letter(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
    // https://stackoverflow.com/a/38757490
    const split_at = (index, xs) => [xs.slice(0, index), xs.slice(index)]

    const split_day = split_at(3, day);
    const formatted_day = `${capitalize_first_letter(split_day[0])} ${split_day[1]}`;
    const formatted_category = capitalize_first_letter(category);

    fetch(ut.phpProxy + urls[type][category][day])
    .then(response => response.json())
    .then(geojson => {
        geojson = fix_geojson_layering(geojson);
        plot_data(geojson, formatted_day, formatted_category);
    })
}

module.exports = fetch_spc_data;