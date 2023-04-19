const ut = require('../utils');
const nexrad_locations = require('../libnexrad/nexrad_locations').NEXRAD_LOCATIONS;
const get_date_diff = require('../misc/get_date_diff');
const get_station_status = require('../misc/getStationStatus');

// https://www.weather.gov/nl2/NEXRADView

function showRadarStatus(station) {
    if (station == 'No Station Selected') {
        ut.displayAtticDialog({
            'title': 'Error',
            'body': '<div>Please <b>select a radar station</b> before attempting to view station info.</div',
            'color': 'rgb(186, 48, 67)',
            'textColor': '#f8d7da',
        })
        return;
    }

    var latestURL = `https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/DS.75ftm/SI.${station.toLowerCase()}/sn.last`
    var url = ut.preventFileCaching(ut.phpProxy + latestURL + '#');
    // console.log(url)
    fetch(url)
    .then(response => {
        response.text().then(text => {
            console.log(text);
            const file_modified_date = response.headers.get('Last-Modified');

            var message_date_string;
            var message_date_obj;
            // convert to uppercase so we don't run into case issues
            const message_text_to_use = text.toUpperCase();
            // split the FTM product into lines
            const newline_split = message_text_to_use.split(/\r?\n/);
            // find and return the line that contains 'Message Date'
            const match = newline_split.find(element => { if (element.includes('MESSAGE DATE')) { return true; } });
            if (match !== undefined) { // we want to extract the message send time from the message itself, preferably
                // remove the string from the line, we only need the date text (e.g. 'Sep 14 2022 14:17:04')
                const date_str = match.replace('MESSAGE DATE:  ', '');
                // convert to a date object in UTC time
                const date_obj = new Date(`${date_str} UTC`);
                message_date_obj = date_obj;
                message_date_string = ut.printFancyTime(date_obj);
            } else { // if not, we'll use the "Last-Modified" header for the message file
                // convert to a date object in UTC time
                const date_obj = new Date(`${file_modified_date} UTC`);
                message_date_obj = date_obj;
                message_date_string = ut.printFancyTime(date_obj);
            }

            const date_diff = get_date_diff(message_date_obj, 'radar_message');
            var message_age = `<b class='${date_diff.class}'>${date_diff.formatted} old</b>`;

            const radar_station_status = window.atticData.radar_station_status;
            const current_station_status = radar_station_status[station].status;
            var radar_station_status_div;
            if (radar_station_status == undefined) {
                radar_station_status_div = `<b>unknown</b>`;
            } else {
                if (current_station_status == 'up') {
                    radar_station_status_div = `<b class='new-file'>ONLINE</b>`;
                } else if (current_station_status == 'down') {
                    radar_station_status_div = `<b class='old-file'>OFFLINE</b>`;
                }
            }

            var html_content = 
`<b>Radar Station: </b>${station}
<b>Radar Name: </b>${nexrad_locations[station].name}
<b>Radar Type: </b>${nexrad_locations[station].type}
<b>Station Status: ${radar_station_status_div}</b>

<b>Message Send Time: </b>${message_date_string}
<div style="white-space: pre-wrap;"><b>Message (${message_age}):</b><div class="code">${text}</div></div>`

            ut.displayAtticDialog({
                'title': `${station} Info`,
                'body': html_content,
                'color': 'rgb(37, 94, 151)',
                'textColor': 'rgb(182, 218, 255)',
            })
        });
    });
}

$('#radarStation').on('click', function() {
    showRadarStatus($('#radarStation').text())
})

//module.exports = showRadarStatus;