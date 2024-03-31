const ut = require('../../core/utils');

var allStationStatusObj = {};
function getStationStatus(callback) {
    $.getJSON('https://api.weather.gov/radar/stations', function (data) {
        for (let n = 0; n < data.features.length; n++) {
            var radarStation = data.features[n].properties.id;
            var latt = data.features[n].geometry.coordinates[1];
            var lonn = data.features[n].geometry.coordinates[0];
            var stationType = data.features[n].properties.stationType;

            var nonDateRadstatLastReceivedData = data.features[n].properties.latency.levelTwoLastReceivedTime;
            var radstatLastReceivedData = new Date(data.features[n].properties.latency.levelTwoLastReceivedTime);
            var currentTimeForStatus = new Date();
            var timeDiff = currentTimeForStatus - radstatLastReceivedData;
            var formattedLastReceivedData = ut.printFancyTime(radstatLastReceivedData);

            if (timeDiff >= 900000) {
                //allStationStatusArray.push([radarStation, 'down', [nonDateRadstatLastReceivedData, stationType]]);
                allStationStatusObj[radarStation] = {
                    'status': 'down',
                    'lastRecievedL2': nonDateRadstatLastReceivedData,
                    'stationType': stationType
                }
            } else if (timeDiff < 900000) {
                //allStationStatusArray.push([radarStation, 'up', [nonDateRadstatLastReceivedData, stationType]]);
                allStationStatusObj[radarStation] = {
                    'status': 'up',
                    'lastRecievedL2': nonDateRadstatLastReceivedData,
                    'stationType': stationType
                }
            }
        }
        allStationStatusObj['KHDC'] = {
            'status': 'up',
            'lastRecievedL2': new Date().toISOString(),
            'stationType': 'WSR-88D'
        }
        $('#dataDiv').data('stationStatusObj', allStationStatusObj);
        callback(allStationStatusObj);
    })
}

module.exports = getStationStatus;