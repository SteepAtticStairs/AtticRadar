const ut = require('../../core/utils');
const nhc_format_data = require('./nhc_format_data');

const nhc_storage = {
    'hurricanes': {},
    'outlooks': {}
}

function _fetch_outlooks(nhc_storage, callback) {
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

function _list_storms(callback) {
    const nhc_storm_list_url = `https://www.nhc.noaa.gov/CurrentStorms.json`;

    fetch(ut.phpProxy + nhc_storm_list_url)
    .then(response => response.json())
    .then(json => {
        if (json.activeStorms.length == 0) {
            callback(nhc_storage);
        } else {
            for (var i = 0; i < json.activeStorms.length; i++) {
                const storm_name = json.activeStorms[i].name;
                var storm_id = json.activeStorms[i].id;
                storm_id = storm_id.toUpperCase();

                nhc_storage.hurricanes[storm_id] = {
                    'name': storm_name,
                    'cone_kmz': '',
                    'track_kmz': '',
                    'last_update': json.activeStorms[i].lastUpdate,
                }
            }

            callback(nhc_storage);
        }
    })
}

function _fetch_kmz(nhc_storage, callback) {
    const nhc_ids = Object.keys(nhc_storage.hurricanes);

    function _nhc_fetch_from_ids(cb, index = 0) {
        const id = nhc_ids[index];
        const cone_url = `https://www.nhc.noaa.gov/storm_graphics/api/${id}_CONE_latest.kmz`;
        const track_url = `https://www.nhc.noaa.gov/storm_graphics/api/${id}_TRACK_latest.kmz`;

        fetch(ut.phpProxy + cone_url)
        .then(response => response.blob())
        .then(blob => {
            blob.lastModifiedDate = new Date();
            blob.name = cone_url;
            nhc_storage.hurricanes[id].cone_kmz = blob;

            fetch(ut.phpProxy + track_url)
            .then(response => response.blob())
            .then(blob => {
                blob.lastModifiedDate = new Date();
                blob.name = track_url;
                nhc_storage.hurricanes[id].track_kmz = blob;

                if (index < nhc_ids.length - 1) {
                    _nhc_fetch_from_ids(cb, index + 1);
                } else {
                    cb();
                }
            })
        })
    }

    _nhc_fetch_from_ids(() => {
        callback(nhc_storage);
    });
}

function nhc_fetch_data(callback) {
    _list_storms((nhc_storage) => {
        _fetch_kmz(nhc_storage, (nhc_storage) => {
            _fetch_outlooks(nhc_storage, (nhc_storage) => {
                nhc_format_data(nhc_storage, callback);
            })
        })
    })
}

module.exports = nhc_fetch_data;