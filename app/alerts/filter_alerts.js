const warnings_whitelist = [
    'Tornado Warning',
    'Severe Thunderstorm Warning',
    'Flash Flood Warning',
    'Special Marine Warning',
    'Snow Squall Warning',
];

function filter_alerts(alerts_data) {
    const alerts_whitelist = [];

    const show_warnings = $('#armrWarningsBtnSwitchElem').is(':checked');
    window.atticData.show_warnings = show_warnings;
    const show_watches = $('#armrWatchesBtnSwitchElem').is(':checked');
    window.atticData.show_warnings = show_watches;
    const show_statements = $('#armrStatementsBtnSwitchElem').is(':checked');
    window.atticData.show_statements = show_statements;
    const show_advisories = $('#armrAdvisoriesBtnSwitchElem').is(':checked');
    window.atticData.show_advisories = show_advisories;

    if (show_warnings) {
        alerts_whitelist.push(...warnings_whitelist);
    }

    alerts_data.features = alerts_data.features.filter((feature) => {
        const current_alert_name = feature.properties.event;

        if (show_watches && current_alert_name.includes('Watch') && !alerts_whitelist.includes(current_alert_name)) {
            alerts_whitelist.push(current_alert_name);
        }
        if (show_statements && current_alert_name.includes('Statement') && !alerts_whitelist.includes(current_alert_name)) {
            alerts_whitelist.push(current_alert_name);
        }
        if (show_advisories && current_alert_name.includes('Advisory') && !alerts_whitelist.includes(current_alert_name)) {
            alerts_whitelist.push(current_alert_name);
        }

        return alerts_whitelist.includes(current_alert_name);
    });
    return alerts_data;
}

module.exports = filter_alerts;