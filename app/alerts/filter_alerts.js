const warnings_whitelist = [
    'Tornado Warning',
    'Severe Thunderstorm Warning',
    'Flash Flood Warning',
    'Special Marine Warning',
    'Snow Squall Warning',
];
const watches_whitelist = [
    'Flood Watch',
];

function filter_alerts(alerts_data) {
    const alerts_whitelist = [];

    const show_warnings = $('#armrWarningsBtnSwitchElem').is(':checked');
    window.atticData.show_warnings = show_warnings;
    const show_watches = $('#armrWatchesBtnSwitchElem').is(':checked');
    window.atticData.show_warnings = show_watches;
    if (show_warnings) {
        alerts_whitelist.push(...warnings_whitelist);
    }
    // if (show_watches) {
    //     alerts_whitelist.push(...watches_whitelist);
    // }

    alerts_data.features = alerts_data.features.filter((feature) => {
        const current_alert_name = feature.properties.event;
        if (show_watches && current_alert_name.includes('Watch') && !alerts_whitelist.includes(current_alert_name)) {
            alerts_whitelist.push(current_alert_name);
        }

        return alerts_whitelist.includes(current_alert_name);
    });
    return alerts_data;
}

module.exports = filter_alerts;