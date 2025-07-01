const nhc_process_data = require('./nhc/nhc_process_data');
const nhc_process_outlooks = require('./nhc/nhc_process_outlooks');

function init_hurricane_loading() {
    window.atticData.hurricane_layers = [];

    nhc_process_data();
    nhc_process_outlooks();
}

module.exports = init_hurricane_loading;