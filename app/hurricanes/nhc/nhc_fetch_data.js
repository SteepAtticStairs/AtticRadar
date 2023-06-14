const ut = require('../../core/utils');

const nhc_storage = {
    'hurricanes': {},
    'outlooks': {}
}

function _fetch_outlooks(callback) {
    const outlook_urls = [
        'https://www.nhc.noaa.gov/xgtwo/gtwo_atl.kmz',
        'https://www.nhc.noaa.gov/xgtwo/gtwo_pac.kmz',
        'https://www.nhc.noaa.gov/xgtwo/gtwo_cpac.kmz'
    ];

    function _fetch_individual_outlook(cb, index = 0) {
        const url = outlook_urls[index];
        const split_url = url.split('/');
        const id = split_url[split_url.length - 1].replace('.kmz', '');

        fetch(ut.phpProxy + url)
            .then(response => response.blob())
            .then(blob => {
                blob.lastModifiedDate = new Date();
                blob.name = url;

                nhc_storage.outlooks[id] = {};
                nhc_storage.outlooks[id].kmz = blob;

                if (index < outlook_urls.length - 1) {
                    _fetch_individual_outlook(cb, index + 1);
                } else {
                    cb();
                }
            })
    }

    _fetch_individual_outlook(() => {
        callback(nhc_storage);
    });
}

function nhc_fetch_data(callback) {
    _fetch_outlooks((nhc_storage) => {
        callback(nhc_storage);
    })
}

module.exports = nhc_fetch_data;