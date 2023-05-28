const warnings_whitelist = [
    'Tornado Warning',
    'Severe Thunderstorm Warning',
    'Flash Flood Warning',
    'Special Marine Warning',
    'Snow Squall Warning',
];

function filter_alerts(alerts_data) {
    // const EUP_checked = $('#armrEUPBtnSwitchElem').is(':checked');
    // window.atticData.EUP_checked = EUP_checked;
    const show_warnings = $('#armrWarningsBtnSwitchElem').is(':checked');
    window.atticData.show_warnings = show_warnings;
    const show_watches = $('#armrWatchesBtnSwitchElem').is(':checked');
    window.atticData.show_warnings = show_watches;
    const show_statements = $('#armrStatementsBtnSwitchElem').is(':checked');
    window.atticData.show_statements = show_statements;
    const show_advisories = $('#armrAdvisoriesBtnSwitchElem').is(':checked');
    window.atticData.show_advisories = show_advisories;
    const show_other = $('#armrOtherBtnSwitchElem').is(':checked');
    window.atticData.show_other = show_other;

    function _check_alert(current_alert_name, has_geometry, boolean_array) {
        var should_return = false;

        if (boolean_array[0] && current_alert_name.includes('Warning') && current_alert_name != 'Flood Warning') {
            if (has_geometry) should_return = true;
        }
        if (boolean_array[1] && current_alert_name.includes('Statement')) {
            if (has_geometry) should_return = true;
        }
        if (boolean_array[2] && current_alert_name.includes('Watch')) {
            should_return = true;
        }
        if (boolean_array[3] && current_alert_name.includes('Advisory')) {
            should_return = true;
        }

        return should_return;
    }

    alerts_data.features = alerts_data.features.filter((feature) => {
        const current_alert_name = feature.properties.event;
        const has_geometry = feature.geometry != null;

        var should_return = _check_alert(current_alert_name, has_geometry, [show_warnings, show_statements, show_watches, show_advisories]);
        if (show_other) {
            // this simulates a check on all other alert filter parameters.
            // essentially, if the current alert wouldn't be shown if everything
            // else was enabled, in other words, if every other option box was checked,
            // it's an "other" alert.
            if (!_check_alert(current_alert_name, has_geometry, [true, true, true, true])) {
                should_return = true;
            }
        }
        return should_return;
    });

    return alerts_data;
}

module.exports = filter_alerts;