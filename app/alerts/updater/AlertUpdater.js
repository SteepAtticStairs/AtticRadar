class AlertUpdater {
    constructor() {
        const return_data = require('../fetch_data').return_data;
        const plot_alerts = require('../plot_alerts');

        this.latest_date = undefined;

        this.get_new_data_func = return_data;
        this.plot_func = plot_alerts;
    }

    enable() {
        this._check_for_new_file();
        // check for new alert data every 15 seconds
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

        this.get_new_data_func((alerts_data) => {
            const fetched_date = DateTime.fromISO(alerts_data.updated);
            const fetched_date_ms = fetched_date.toMillis();

            if (this.latest_date == undefined) {
                this.latest_date = fetched_date_ms;
            }

            // console.log(fetched_date_ms, this.latest_date);

            if (fetched_date_ms > this.latest_date) {
                console.log(`Successfully found new alert data at ${formatted_now}.`);
                this.plot_func(alerts_data);
                this.latest_date = fetched_date_ms;
            } else {
                console.log(`There is no new alert data as of ${formatted_now}. Last data was at ${fetched_date.toFormat('h:mm.ss a ZZZZ')}.`);
            }
        })
    }
}

module.exports = AlertUpdater;