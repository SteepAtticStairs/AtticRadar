//var map = require('../map/map');
const ut = require('../utils');

// https://www.weather.gov/nl2/NEXRADView

function resetStationDiv(station) {
    setTimeout(function() {
        $('#radarStationIcon').removeClass('fa-bounce');
        document.getElementById('radarStation').innerHTML = station;
    }, 500)
}

function showRadarStatus(station) {
    if (station == 'No Station Selected') {
        ut.spawnModal({
            'title': 'Error',
            'headerColor': 'alert-danger',
            'body': '<div>Please <b>select a radar station</b> before attempting to view station info.</div>'
        })
        return;
    }
    document.getElementById('radarStation').innerHTML = 'Loading...'
    $('#radarStationIcon').addClass('fa-bounce');
    //var radmessageURL = `https://api.weather.gov/products/types/FTM/locations/${station.substring(1)}/#`;
    //$.getJSON(ut.preventFileCaching(radmessageURL), function (data) {
    var radstatURL = `https://api.weather.gov/radar/stations/${station}/#`;
    $.getJSON(ut.preventFileCaching(ut.phpProxy + radstatURL), function(stationData) {
        var radarType = stationData.properties.stationType;
        var radstatLastReceivedData = ut.printFancyTime(new Date(stationData.properties.latency.levelTwoLastReceivedTime));
        var stationName = stationData.properties.name;

        var latestURL = `https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/DS.75ftm/SI.${station.toLowerCase()}/sn.last`
        $.get(ut.preventFileCaching(ut.phpProxy + latestURL), function (data) {
            // var radstatMessageIssuanceTime = new Date(data.issuanceTime);
            // var radstatMessageText = data.productText;

            // // extract the text in between the \n\n sequences -
            // // that text is all we need
            // var middle = radstatMessageText.slice(
            //     radstatMessageText.indexOf('\n\n') + 1,
            //     radstatMessageText.lastIndexOf('\n\n'),
            // );

            // radstatMessageText.replace(/\n/g, '<br>');
            // var messageID = `<a class='false-anchor' onclick='window.location.href = "${msgURL}"'>${data.id}</a>`;
            // var messageName = data.productName;
            // var messageTime = ut.printFancyTime(radstatMessageIssuanceTime);

            var messageText = data;
            var messageTime;

            try {
                // convert to uppercase so we don't run into case issues
                var messageTextToUse = messageText.toUpperCase();
                // split the FTM product into lines
                var newlineSplit = messageTextToUse.split(/\r?\n/);
                // find and return the line that contains 'Message Date'
                const match = newlineSplit.find(element => { if (element.includes('MESSAGE DATE')) { return true; } });
                // remove the string from the line, we only need the date data (e.g. 'Sep 14 2022 14:17:04')
                var dateStr = match.replace('MESSAGE DATE:  ', '');
                // convert to a date object in UTC time
                var dateObj = new Date(`${dateStr} UTC`);
                messageTime = ut.printFancyTime(dateObj);
            } catch (e) {
                console.warn(e);
                messageTime = 'There was an error while parsing the message time.'
            }

            var htmlContent = 
            `<div><b>Radar Station: </b>${station}</div>
            <div><b>Radar Name: </b>${stationName}</div>
            <!-- <div><b>Data Last Recieved: </b>${radstatLastReceivedData}</div> -->
            <br>
            <div><b>Message Send Time: </b>${messageTime}</div>
            <div style="white-space: pre-wrap;"><b>Message: </b><div class="code">${messageText}</div></div>`
            ut.spawnModal({
                'title': `${station} Info`,
                'headerColor': 'alert-warning',
                'body': htmlContent
            })
            resetStationDiv(station);

            // document.getElementById('radstatMessageID').innerHTML = `${data.id}<br><div class='false-anchor' onclick='window.location.href = "${msgURL}"'>${msgURL}</a>`;
            // document.getElementById('radstatMessageName').innerHTML = data.productName;
            // document.getElementById('radstatMessage').innerHTML = radstatMessageText;
            // document.getElementById('radstatMessageTime').innerHTML = printFancyTime(radstatMessageIssuanceTime);

            console.log(messageText);
        });
    });
    //});
}

$('#radarStationParent').on('click', function() {
    showRadarStatus($('#radarStation').text())
})

//module.exports = showRadarStatus;