const drawChart = require('../../tides/chart');
const fetchData = require('../../tides/fetchData');
const ut = require('../utils');

var parser = document.createElement('a');
parser.href = window.location.href;
//console.log(parser.hash);

var allParserArgs = parser.hash.split('&');
//console.log(allParserArgs)

var isDevelopmentMode = false;
for (key in allParserArgs) {
    if (allParserArgs[key].includes('#station=')) {
        //console.log('we got a station URL parameter!');
        $('#stationInp').val(allParserArgs[key].slice(9, 13));
    }
    if (allParserArgs[key].includes('#tideStation=')) {
        fetchData(allParserArgs[key].slice(13), function(tideHeightArr) {
            drawChart(ut.tideChartDivName, tideHeightArr);
        });
    }
    if (allParserArgs[key].includes('#development')) {
        //console.log('we got a development mode URL parameter!');
        isDevelopmentMode = true;
    }
}

module.exports = isDevelopmentMode;