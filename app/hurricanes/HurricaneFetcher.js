const ut = require('../core/utils');

const jtwc_storm_list_url = `https://www.metoc.navy.mil/jtwc/rss/jtwc.rss`;
const nhc_storm_list_url = `https://www.nhc.noaa.gov/CurrentStorms.json`;

class HurricaneFetcher {
    constructor(callback) {
        this.list_storms((master_storms_list) => {
            this.fetch_kmz(master_storms_list, (master_storms_list) => {
                this.fetch_forecast_text(master_storms_list, (master_storms_list) => {
                    callback(master_storms_list);
                });
            });
        });
    }

    fetch_forecast_text(master_storms_list, callback) {
        const jtwc_ids = Object.keys(master_storms_list.jtwc);

        function _jtwc_fetch_from_ids(cb, index = 0) {
            const id = jtwc_ids[index];
            const formatted_id = id.slice(0, 4) + '20' + id.slice(4, 6); // convert to the correct format here

            const forecast_text_url = `https://www.nrlmry.navy.mil/atcf_web/docs/current_storms/${formatted_id.toLowerCase()}.fst`;
            fetch(ut.phpProxy + forecast_text_url)
            .then(response => response.text())
            .then(text => {
                master_storms_list.jtwc[id].forecast_text = text;

                if (index < jtwc_ids.length - 1) {
                    _jtwc_fetch_from_ids(cb, index + 1);
                } else {
                    cb();
                }
            })
        }

        _jtwc_fetch_from_ids(() => {
            callback(master_storms_list);
        });
    }

    fetch_kmz(master_storms_list, callback) {
        const jtwc_ids = Object.keys(master_storms_list.jtwc);

        function _jtwc_fetch_from_ids(cb, index = 0) {
            const id = jtwc_ids[index];
            const kmz_url = `https://www.metoc.navy.mil/jtwc/products/${id.toLowerCase()}.kmz`;
            fetch(ut.phpProxy + kmz_url)
            .then(response => response.blob())
            .then(blob => {
                blob.lastModifiedDate = new Date();
                blob.name = kmz_url;

                master_storms_list.jtwc[id].kmz = blob;

                if (index < jtwc_ids.length - 1) {
                    _jtwc_fetch_from_ids(cb, index + 1);
                } else {
                    cb();
                }
            })
        }

        _jtwc_fetch_from_ids(() => {
            callback(master_storms_list);
        });
    }

    list_storms(callback) {
        const master_storms_list = {
            'nhc': {},
            'jtwc': {}
        }

        fetch(ut.phpProxy + jtwc_storm_list_url)
        .then(response => response.text())
        .then(text => {
            const jtwc_ids = this._parse_jtwc_text(text);

            for (var i = 0; i < jtwc_ids.length; i++) {
                master_storms_list.jtwc[jtwc_ids[i]] = {
                    'kmz': ''
                }
            }

            callback(master_storms_list);
        })
    }

    _parse_jtwc_text(text) {
        // Regular expression pattern to match the URL
        const url_pattern = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
        // Find all occurrences of the URL pattern in the HTML code
        const matches = [...text.matchAll(url_pattern)];

        const ids = [];
        for (var i = 0; i < matches.length; i++) {
            const url = matches[i][2];
            if (url.includes('kmz')) {
                const url_parts = url.split('/');
                const id = url_parts[url_parts.length - 1].replaceAll('.kmz', '');
                ids.push(id);
            }
        }
        return ids;
    }
}

module.exports = HurricaneFetcher;