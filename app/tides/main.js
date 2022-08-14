const drawChart = require('./chart');
const fetchData = require('./fetchData');

/*
https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=20220813&end_date=20221014&datum=MLLW&station=8656590&time_zone=lst_ldt&units=english&interval=hilo&format=json
https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=8656590
https://tidesandcurrents.noaa.gov/map/index.html?type=TidePredictions
*/

// initialize the modal
$('#modalBtn').trigger('click');

// 8656590 - north carolina station
// 8634214 - virginia station
// 9455934 - alaska station
var stationID = '8656590';
function loadChart(divName) {
    fetchData(stationID, function(tideHeightArr) {
        console.log(tideHeightArr);
        drawChart(divName, tideHeightArr);
    })
}

module.exports = {
    loadChart
}