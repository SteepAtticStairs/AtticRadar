const ut = require('../core/utils');
const urls = require('./urls');
const plot_data = require('./plot_data');
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

function fetch_spc_data(type, category, day) {
    const elem = $(`#armrSPC_${type}-${category}-${day}_BtnSwitchElem`);
    const atticRadarMenuRow = elem.closest('.atticRadarMenuRow');
    atticRadarMenuRow.append(`<i class="helperText" style="opacity: 50%">&nbsp;&nbsp;&nbsp;Loading...</i>`);

    fetch(ut.phpProxy + urls[type][category][day])
    .then(response => response.json())
    .then(json => {
        const [issue_formatted, expire_formatted] = _return_time_range(json);

        // atticRadarMenuRow.find('.helperText').remove();
        $('.helperText').remove();
        if (turf.coordAll(json).length == 0) {
            atticRadarMenuRow
                .addClass('atticRadarMenuRowDisabled')
                .append(
`<i class="helperTextDisabled" style="opacity: 50%">\
<p style="margin: 0px; font-size: 11px; font-weight: bold">&nbsp;&nbsp;&nbsp;NO DATA</p>\
${_return_time_range_html(issue_formatted, expire_formatted)}\
</i>`
);
            elem[0].checked = false;
        } else {
            atticRadarMenuRow
                .append(`<i class="helperText" style="opacity: 50%">${_return_time_range_html(issue_formatted, expire_formatted)}</i>`);
            plot_data(json);
        }
    })
}

module.exports = fetch_spc_data;