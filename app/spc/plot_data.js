const map = require('../core/map/map');
const set_layer_order = require('../core/map/setLayerOrder');
const turf = require('@turf/turf');
const luxon = require('luxon');
const AtticPopup = require('../core/popup/AtticPopup');
const ut = require('../core/utils');

function _return_time_range(json) {
    var issue;
    var expire;
    turf.propEach(json, (current_properties, feature_index) => {
        expire = current_properties.EXPIRE;
        issue = current_properties.ISSUE;
    });

    function _parse_format_date_string(date_string) {
        const date = luxon.DateTime.fromFormat(date_string, 'yyyyMMddHHmm', { zone: 'UTC' });
        const formatted_date = date.toLocal().toFormat('EEE MMM d, h:mm a'); // EEE h:mm a
        return formatted_date;
    }

    const issue_formatted = _parse_format_date_string(issue);
    const expire_formatted = _parse_format_date_string(expire);
    const full_formatted = `${issue_formatted} - ${expire_formatted}`;
    return [issue_formatted, expire_formatted];
}

function _return_time_range_html(issue_formatted, expire_formatted) {
    return `\
<p style="margin: 0px; font-size: 11px">&nbsp;&nbsp;&nbsp;${issue_formatted} thru</p>\
<p style="margin: 0px; font-size: 11px">&nbsp;&nbsp;&nbsp;${expire_formatted}</p>`;
}

function _hide_layers() {
    if (map.getLayer('spc_fill')) {
        // map.setLayoutProperty('spc_fill', 'visibility', 'none');
        // map.setLayoutProperty('spc_border', 'visibility', 'none');
        map.removeLayer('spc_fill');
        map.removeLayer('spc_border');
        map.removeSource('spc_source');
    }
}

function _get_text_url(category, day) {
    if (category == 'Categorical') {
        return `https://tgftp.nws.noaa.gov/data/raw/ac/acus0${day}.kwns.swo.dy${day}.txt`;
    }
}

function _click_listener(e) {
    const properties = e.features[0].properties;

    var current_info = $('#spcDataInfo').find('b').text();
    current_info = current_info.split(' ');
    const category = current_info[0];
    const day = current_info[current_info.length - 1];

    const text_url = _get_text_url(category, day);
    fetch(ut.phpProxy + text_url)
    .then(response => response.text())
    .then(text => {
        console.log(text);
    })

    const popup_html = 
`<div><b>${properties.LABEL2}</b></div>`

    // new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000' })
    // .setLngLat(e.lngLat)
    // .setHTML(popup_html)
    // .addTo(map);
    new AtticPopup(e.lngLat, popup_html).add_to_map();
}

function plot_data(geojson, formatted_day, formatted_category) {
    const is_empty = turf.coordAll(geojson).length == 0;
    const [issue_formatted, expire_formatted] = _return_time_range(geojson);

    var spc_info_html =
`<b>${formatted_category} - ${formatted_day}</b>`

    if (is_empty) {
        spc_info_html +=
`<p style="margin: 0px; font-size: 13px; font-weight: bold" class="old-file">EMPTY DATA</p>`
    }

    spc_info_html +=
`<i class="helperText" style="opacity: 50%">
${_return_time_range_html(issue_formatted, expire_formatted)}
</i>`;
    $('#spcDataInfo').html(spc_info_html);

    _hide_layers();

    map.addSource('spc_source', {
        'type': 'geojson',
        data: geojson
    });

    // fill
    map.addLayer({
        'id': 'spc_fill',
        'type': 'fill',
        'source': 'spc_source',
        'paint': {
            'fill-outline-color': ['get', 'stroke'],
            'fill-color': ['get', 'fill'],
            'fill-opacity': 1, // 0.5
        },
        'layout': {
            'fill-sort-key': ['get', 'zindex']
        }
    });
    // outline
    map.addLayer({
        'id': 'spc_border',
        'type': 'line',
        'source': 'spc_source',
        'paint': {
            'line-color': ['get', 'stroke'],
            'line-width': 3
        },
        'layout': {
            'line-sort-key': ['get', 'zindex']
        }
    });

    set_layer_order();

    map.off('click', 'spc_fill', _click_listener);
    map.on('click', 'spc_fill', _click_listener);
}

module.exports = plot_data;