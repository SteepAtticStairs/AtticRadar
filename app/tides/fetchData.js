function getYYMMDD(dateObj, type, modifier) {
    // https://stackoverflow.com/a/1296374
    if (type == 'start') {
        dateObj.setDate(dateObj.getDate() - modifier);
    } else if (type == 'end') {
        dateObj.setDate(dateObj.getDate() + modifier);
    }

    var year = dateObj.getUTCFullYear();
    var month = dateObj.getUTCMonth() + 1;
    if (month.toString().length == 1) month = "0" + month.toString();
    var day = dateObj.getUTCDate();
    if (day.toString().length == 1) day = "0" + day.toString();
    var yyyymmdd = `${year}${month}${day}`;
    return yyyymmdd;
}

function fetchData(stationID, callback) {
    // load station information
    var stationIdUrl = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${stationID}.json`
    $.getJSON(stationIdUrl, function(data) {
        const name = data.stations[0].name;
        const id = data.stations[0].id;

        document.getElementById('exampleModalLabel').innerHTML = `${name} [${id}]`;
    })

    var startDay = getYYMMDD(new Date(), 'start', 1);
    var endDay = getYYMMDD(new Date(), 'end', 1);

    var tidesURL = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=${startDay}&end_date=${endDay}&datum=MLLW&station=${stationID}&time_zone=lst_ldt&units=english&interval=hilo&format=json`;
    $.getJSON(tidesURL, function(data) {
        console.log(tidesURL)
        var tideHeightArr = [];
        tideHeightArr.push([new Date(), "", null, 0]);
        // tideHeightArr.push(['Time', 'Height'])
        for (key in data.predictions) {
            var value = parseFloat(data.predictions[key].v);
            // we need to replace the space in the middle with a T and append a Z, because safari won't parse the string otherwise
            var time = new Date(data.predictions[key].t.replace(' ', 'T') + 'Z');
            var formattedTime = `${time.getMonth()}/${time.getDate()}`;

            tideHeightArr.push([time, null, value, value + 2]);
        }
        callback(tideHeightArr);
    })
}

module.exports = fetchData;