const nhc_process_data = require('./nhc/nhc_process_data');

function init_hurricane_loading() {
    window.atticData.hurricane_layers = [];

    nhc_process_data();
}

module.exports = init_hurricane_loading;