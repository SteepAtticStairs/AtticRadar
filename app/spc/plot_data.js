const map = require('../core/map/map');
const set_layer_order = require('../core/map/setLayerOrder');
const turf = require('@turf/turf');
const luxon = require('luxon');

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

function _click_listener(e) {
    const properties = e.features[0].properties;

    const popup_html = 
`<div><b>${properties.LABEL2}</b></div>`

    new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000' })
    .setLngLat(e.lngLat)
    .setHTML(popup_html)
    .addTo(map);
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
            'fill-color': ['get', 'fill'],
            'fill-opacity': 1 // 0.5
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
        }
    });

    set_layer_order();

    map.off('click', 'spc_fill', _click_listener);
    map.on('click', 'spc_fill', _click_listener);
}

module.exports = plot_data;