const ut = require('../radar/utils');

function parseStormTypeForecast(csvJsonData) {
    var stormTypeObj = {};
    for (var item in csvJsonData) {
        var forecastHour = csvJsonData[item][5];
        var stormType = csvJsonData[item][10];
        if (forecastHour != undefined) {
            stormTypeObj[forecastHour] = stormType;
        }
    }
    return stormTypeObj;
}
function getForecastFile(stormID, cb) {
    var fstFileURL = ut.preventFileCaching(ut.phpProxy + `https://ftp.nhc.noaa.gov/atcf/fst/${stormID.toLowerCase()}.fst#`);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4){   // if complete
            if (xhr.status === 200){  // check if "OK" (200)
                cb(this.responseText);
            } else {
                cb('fetchError');
            }
        } 
    }
    xhr.open('GET', fstFileURL, true);
    xhr.send();
}

function stormTypeData(hurricaneID, cb) {
    getForecastFile(hurricaneID, function(data) {
        var json = ut.csvToJson(data);
        $('#dataDiv').data(`${hurricaneID}_hurricaneData`, json)
        var stormTypeForecast = parseStormTypeForecast(json);
        cb(stormTypeForecast);
    })
}

module.exports = stormTypeData;