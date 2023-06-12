const ut = require('../core/utils');
const urls = require('./urls');
const plot_data = require('./plot_data');
const turf = require('@turf/turf');

function fetch_spc_data(type, category, day) {
    fetch(ut.phpProxy + urls[type][category][day])
    .then(response => response.json())
    .then(json => {
        if (turf.coordAll(json).length == 0) {
            const elem = $(`#armrSPC_${type}-${category}-${day}_BtnSwitchElem`);
            elem.closest('.atticRadarMenuRow')
                .addClass('atticRadarMenuRowDisabled')
                .append(`&nbsp;<i style="opacity: 50%">(no data)</i>`);
            elem[0].checked = false;
        } else {
            plot_data(json);
        }
    })
}

module.exports = fetch_spc_data;