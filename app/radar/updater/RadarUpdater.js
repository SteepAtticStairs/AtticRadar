const product_abbv_dict = {
    'N0Q': 'p94r0',
    'N1Q': 'p94r1',
    'N2Q': 'p94r2',
    'N3Q': 'p94r3',

    'N0U': 'p99v0',
    'N1U': 'p99v1',
    'N2U': 'p99v2',
    'N3U': 'p99v3',

    // 'DVL': '134il'
}

class RadarUpdater {
    constructor(nexrad_factory) {
        const loaders_nexrad = require('../libnexrad/loaders_nexrad');

        this.nexrad_factory = nexrad_factory;
        this.latest_date = undefined;

        var get_latest_url_func;
        var plot_func;
        if (this.nexrad_factory.nexrad_level == 2) {
            get_latest_url_func = loaders_nexrad.get_latest_level_2_url;
        } else if (this.nexrad_factory.nexrad_level == 3) {
            get_latest_url_func = loaders_nexrad.get_latest_level_3_url;
            plot_func = loaders_nexrad.level_3_plot_from_url;
        }
        this.get_latest_url_func = get_latest_url_func;
        this.plot_func = plot_func;
    }

    enable() {
        this._check_for_new_file();
        // check for a new radar scan every 15 seconds
        this.interval = setInterval(() => {
            this._check_for_new_file();
        }, 15000);
    }

    disable() {
        clearInterval(this.interval);
    }

    _check_for_new_file() {
        const { DateTime } = require('luxon');
        const formatted_now = DateTime.now().toFormat('h:mm.ss a ZZZZ');

        // this is so we can update the time elapsed counter in the top right
        this.nexrad_factory.display_file_info();

        var product = this.nexrad_factory.product_abbv;
        if (product_abbv_dict.hasOwnProperty(product)) {
            product = product_abbv_dict[product];
        }
        this.get_latest_url_func(this.nexrad_factory.station, product, 0, (url, fetched_date) => {
            if (this.latest_date == undefined) {
                this.latest_date = fetched_date;
            }

            if (fetched_date.getTime() > this.latest_date.getTime()) {
                console.log(`Successfully found new radar scan at ${formatted_now}.`);
                this.plot_func(url);
            } else {
                console.log(`There is no new radar scan as of ${formatted_now}.`);
            }
        })
    }
}

module.exports = RadarUpdater;