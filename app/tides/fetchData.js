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
    var startDay = getYYMMDD(new Date(), 'start', 1);
    var endDay = getYYMMDD(new Date(), 'end', 1);

    var tidesURL = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=${startDay}&end_date=${endDay}&datum=MLLW&station=${stationID}&time_zone=lst_ldt&units=english&interval=hilo&format=json`;
    $.getJSON(tidesURL, function(data) {
        var tideHeightArr = [];
        // tideHeightArr.push(['Time', 'Height'])
        for (key in data.predictions) {
            var value = parseFloat(data.predictions[key].v);
            var time = new Date(data.predictions[key].t);
            var formattedTime = `${time.getMonth()}/${time.getDate()}`;

            tideHeightArr.push([time, value]);
        }
        callback(tideHeightArr);
    })
}

module.exports = fetchData;