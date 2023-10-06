const warnings_whitelist = [
    'Tornado Warning',
    'Severe Thunderstorm Warning',
    'Flash Flood Warning',
    'Special Marine Warning',
    'Snow Squall Warning',
    'Extreme Wind Warning',
    // 'Hurricane Warning',
    // 'Tropical Storm Warning'
];
const watches_whitelist = [
    'Tornado Watch',
    'Severe Thunderstorm Watch',
    // 'Hurricane Watch',
    // 'Tropical Storm Watch'
];
const statements_whitelist = [
    'Special Weather Statement'
];

function filter_alerts(alerts_data) {
    const show_warnings = $('#armrWarningsBtnSwitchElem').is(':checked');
    window.atticData.show_warnings = show_warnings;
    const show_watches = $('#armrWatchesBtnSwitchElem').is(':checked');
    window.atticData.show_watches = show_watches;
    const show_statements = $('#armrStatementsBtnSwitchElem').is(':checked');
    window.atticData.show_statements = show_statements;

    alerts_data.features = alerts_data.features.filter((feature) => {
        const current_alert_name = feature.properties.event;
        const has_geometry = feature.geometry != null;

        if (show_warnings) {
            if (warnings_whitelist.includes(current_alert_name)) {
                return true;
            }
        }
        if (show_watches) {
            if (watches_whitelist.includes(current_alert_name)) {
                return true;
            }
        }
        if (show_statements) {
            if (statements_whitelist.includes(current_alert_name) && has_geometry) {
                return true;
            }
        }
    });

    return alerts_data;
}

module.exports = filter_alerts;