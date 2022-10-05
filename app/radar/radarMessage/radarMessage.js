//var map = require('../map/map');
const ut = require('../utils');

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
    var radmessageURL = `https://api.weather.gov/products/types/FTM/locations/${station.substring(1)}/#`;
    $.getJSON(ut.preventFileCaching(radmessageURL), function (data) {
        var radstatURL = `https://api.weather.gov/radar/stations/${station}/#`;
        $.getJSON(ut.preventFileCaching(radstatURL), function(stationData) {
            var radarType = stationData.properties.stationType;
            var radstatLastReceivedData = ut.printFancyTime(new Date(stationData.properties.latency.levelTwoLastReceivedTime));
            var stationName = stationData.properties.name;

            // THIS CODE IS TO REPLACE THE @ CHARACTERS WITH "AT"
            // @ json to string
            var stringjson = JSON.stringify(data);
            // replace @ with AT
            var stringjsonwithoutat = stringjson.replace(/@/g, 'AT');
            // re-parse the AT json
            var PARSEDstringjsonwithoutat = JSON.parse(stringjsonwithoutat);

            var emptyJsonString = '{"ATcontext":{"ATversion":"1.1"},"ATgraph":[]}';

            if (JSON.stringify(PARSEDstringjsonwithoutat) === emptyJsonString) {
                console.log(`Station ${station} has no active message.`);

                var message = `No active message for the station ${station}.`;
                var messageID = 'None';
                var messageName = 'None';
                var messageTime = 'None';

                var htmlContent = 
                `<div><b>Radar Station: </b>${station}</div>
                <div><b>Radar Name: </b>${stationName}</div>
                <!-- <div><b>Data Last Recieved: </b>${radstatLastReceivedData}</div> -->
                <br>
                <div><b>Message: </b>${message}</div>`
                ut.spawnModal({
                    'title': `${station} Info`,
                    'headerColor': 'alert-warning',
                    'body': htmlContent
                })
                resetStationDiv(station);
            } else {
                console.log(`Station ${station} has an active message.`);
                var msgURL = `${PARSEDstringjsonwithoutat.ATgraph[0].ATid}/#`;
                $.getJSON(ut.preventFileCaching(msgURL), function (data) {
                    var radstatMessageIssuanceTime = new Date(data.issuanceTime);
                    var radstatMessageText = data.productText;

                    // extract the text in between the \n\n sequences -
                    // that text is all we need
                    var middle = radstatMessageText.slice(
                        radstatMessageText.indexOf('\n\n') + 1,
                        radstatMessageText.lastIndexOf('\n\n'),
                    );

                    radstatMessageText.replace(/\n/g, '<br>');
                    var message = `${data.id}<br><div class='false-anchor' onclick='window.location.href = "${msgURL}"'>${msgURL}</a>`;
                    var messageID = data.productName;
                    var messageName = radstatMessageText;
                    var messageTime = ut.printFancyTime(radstatMessageIssuanceTime);

                    var htmlContent = 
                    `<div><b>Radar Station: </b>${station}</div>
                    <div><b>Radar Name: </b>${stationName}</div>
                    <!-- <div><b>Data Last Recieved: </b>${radstatLastReceivedData}</div> -->
                    <br>
                    <div><b>Message Time: </b>${messageTime}</div>
                    <div style="white-space: pre-wrap;"><b>Message: </b><pre>${radstatMessageText}</pre></div>
                    <br>
                    <div><b>Message ID: </b>${messageID}</div>
                    <div><b>Message Name: </b>${messageName}</div>`
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

                    console.log(radstatMessageText);
                });
            }
        });
    });
}

$('#radarStationParent').on('click', function() {
    showRadarStatus($('#radarStation').text())
})

//module.exports = showRadarStatus;