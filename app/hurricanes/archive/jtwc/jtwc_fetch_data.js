const ut = require('../../core/utils');
const jtwc_format_data = require('./jtwc_format_data');

function _parse_jtwc_text(text) {
    // regex to match the URL
    const url_pattern = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
    const url_matches = [...text.matchAll(url_pattern)];

    // regex to match the cyclone's name
    var name_matches = [];
    var names_found = 0;
    const names_search_base = ut.xmlToJson(text);
    const basins = names_search_base.rss.channel.item;
    for (var i = 0; i < basins.length; i++) {
        const data = basins[i].description['#cdata-section'];
        const name_pattern = /\((.*?)\) Warning/g;
        var matched = data.match(name_pattern);
        if (matched != null) {
            matched = matched.map((match) => match.match(/\((.*?)\)/)[1]);
            name_matches.push(...matched);
        }
    }

    if (name_matches[1] == 'JTWC CDO') {
        throw new Error('No JTWC storms found.');
    }

    const ids = [];
    const names = [];
    for (var i = 0; i < url_matches.length; i++) {
        const url = url_matches[i][2];
        if (url.includes('kmz')) {
            const url_parts = url.split('/');
            const id = url_parts[url_parts.length - 1].replaceAll('.kmz', '');
            ids.push(id);

            const name = name_matches[names_found];
            names.push(name);
            names_found++;
        }
    }
    return [ids, names];
}

function _list_storms(callback) {
    const jtwc_storm_list_url = `https://www.metoc.navy.mil/jtwc/rss/jtwc.rss`;
    const jtwc_storage = {};

    fetch(ut.phpProxy + jtwc_storm_list_url)
    .then(response => response.text())
    .then(text => {
        const [jtwc_ids, jtwc_names] = _parse_jtwc_text(text);

        for (var i = 0; i < jtwc_ids.length; i++) {
            if (!jtwc_ids[i].toUpperCase().includes('EP') && !jtwc_ids[i].toUpperCase().includes('CP')) {
                jtwc_storage[jtwc_ids[i]] = {
                    'name': jtwc_names[i],
                    'kmz': ''
                }
            }
        }

        callback(jtwc_storage);
    })
}

function _fetch_kmz(jtwc_storage, callback) {
    const jtwc_ids = Object.keys(jtwc_storage);

    function _jtwc_fetch_from_ids(cb, index = 0) {
        const id = jtwc_ids[index];
        const kmz_url = `https://www.metoc.navy.mil/jtwc/products/${id.toLowerCase()}.kmz`;
        fetch(ut.phpProxy + kmz_url)
        .then(response => response.blob())
        .then(blob => {
            blob.lastModifiedDate = new Date();
            blob.name = kmz_url;

            jtwc_storage[id].kmz = blob;

            if (index < jtwc_ids.length - 1) {
                _jtwc_fetch_from_ids(cb, index + 1);
            } else {
                cb();
            }
        })
    }

    _jtwc_fetch_from_ids(() => {
        callback(jtwc_storage);
    });
}

function jtwc_fetch_data(callback) {
    _list_storms((jtwc_storage) => {
        _fetch_kmz(jtwc_storage, (jtwc_storage) => {
            jtwc_format_data(jtwc_storage, callback);
        })
    })
}

module.exports = jtwc_fetch_data;