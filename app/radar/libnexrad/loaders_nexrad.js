const ut = require('../utils');

/**
 * Function that fetches a file and returns it as a Buffer.
 * 
 * @param {String} url The path to the file. It can be a local file, or a file stored on a remote server.
 * @param {*} callback A callback function that has a single paramater, which is the buffer of the file.
 */
function file_to_buffer(url, callback) {
    fetch(url)
    .then(response => response.arrayBuffer())
    .then(buffer => {
        var fileBuffer = Buffer.from(buffer);
        callback(fileBuffer);
    });
}

/**
 * Function to get the latest Level 2 file for a station.
 * 
 * @param {String} station - The four letter ICAO of the station. e.g. "KLWX" / "KMHX"
 * @param {Function} callback - The function to run after the retrieval. Use a single variable
 * in this function, this will be a string with the latest file's URL.
 */
function get_latest_level_2_url(station, callback) {
    var curTime = new Date();
    var year = curTime.getUTCFullYear();
    var month = curTime.getUTCMonth() + 1;
    if (month.toString().length == 1) month = "0" + month.toString();
    var day = curTime.getUTCDate();
    if (day.toString().length == 1) day = "0" + day.toString();
    var stationToGet = station.toUpperCase().replace(/ /g, '')
    var fullURL = "https://noaa-nexrad-level2.s3.amazonaws.com/?list-type=2&delimiter=%2F&prefix=" + year + "%2F" + month + "%2F" + day + "%2F" + stationToGet + "%2F"
    //console.log(fullURL)
    var baseURL = 'https://noaa-nexrad-level2.s3.amazonaws.com';
    //https://noaa-nexrad-level2.s3.amazonaws.com/2022/08/09/KATX/KATX20220809_004942_V06
    fullURL = ut.preventFileCaching(fullURL);
    $.get(ut.phpProxy + fullURL, function (data) {
        var dataToWorkWith = JSON.stringify(ut.xmlToJson(data)).replace(/#/g, 'HASH')
        dataToWorkWith = JSON.parse(dataToWorkWith)
        //console.log(dataToWorkWith)
        var filenameKey = dataToWorkWith.ListBucketResult.Contents
        var latestFileName = filenameKey[filenameKey.length - 1].Key.HASHtext.slice(16);
        if (latestFileName.includes('MDM')) {
            latestFileName = filenameKey[filenameKey.length - 2].Key.HASHtext.slice(16);
        }

        var finishedURL = `${baseURL}/${year}/${month}/${day}/${station}/${latestFileName}`;
        callback(finishedURL);
    })
}

/**
 * Function to get the latest Level 3 file for a station.
 * 
 * @param {String} station - The four letter ICAO of the station. e.g. "KLWX" / "KMHX"
 * @param {String} product - Three letter abbreviation of the Level 3 product being retrieved. e.g. "NST", "N0B", "N0G"
 * @param {Number} index - A number that represents the time of the file to load. e.g. 0 for the latest file, 5 for 5 files back, etc.
 * @param {Function} callback - The function to run after the retrieval. Use a single variable
 * in this function, this will be a string with the latest file's URL.
 * @param {Date} date - A value used internally within the function. Do not pass a value for this parameter.
 */
function get_latest_level_3_url(station, product, index, callback, date) {
    if (!(product.length > 3)) {
        /* we need to slice(1) here (remove the first letter) because the level 3 source we
        * are using only accepts a three character ICAO, e.g. "MHX" / "LWX" */
        station = station.slice(1);
        //document.getElementById('spinnerParent').style.display = 'block';
        var curTime;
        if (date == undefined) {
            curTime = new Date();
        } else {
            curTime = date;
        }
        var year = curTime.getUTCFullYear();
        var month = curTime.getUTCMonth() + 1;
        if (month.toString().length == 1) month = "0" + month.toString();
        var day = curTime.getUTCDate();
        if (day.toString().length == 1) day = "0" + day.toString();
        var stationToGet = station.toUpperCase().replace(/ /g, '')
        var urlBase = "https://unidata-nexrad-level3.s3.amazonaws.com/";
        var filenamePrefix = `${station}_${product}_${year}_${month}_${day}`;
        // var urlPrefInfo = '?list-type=2&delimiter=/%2F&prefix=';
        var urlPrefInfo = '?prefix=';
        var fullURL = `${urlBase}${urlPrefInfo}${filenamePrefix}`
        fullURL = ut.preventFileCaching(fullURL);

        const headers = new Headers().append('Cache-Control', 'no-cache');
        fetch(ut.phpProxy + fullURL, {cache: 'no-store', headers: headers}).then(response => response.text())
        .then(function(data) {
        //$.get(ut.phpProxy + fullURL, function (data) {
            try {
                var dataToWorkWith = JSON.stringify(ut.xmlToJson(data)).replace(/#/g, 'HASH')
                dataToWorkWith = JSON.parse(dataToWorkWith)
                //console.log(dataToWorkWith)
                var contentsBase = dataToWorkWith.ListBucketResult.Contents;
                var filenameKey;
                if (Array.isArray(contentsBase)) {
                    filenameKey = contentsBase[contentsBase.length - (index + 1)].Key.HASHtext;
                } else {
                    filenameKey = contentsBase.Key.HASHtext;
                }

                var finishedURL = `${urlBase}${filenameKey}`;
                callback(finishedURL);
            } catch(e) {
                // we don't want to go back days for storm tracking - most of the time an empty directory
                // of storm track files means there are no storm tracks avaliable at the time (e.g. clear skies / no storms)
                if ((product != 'NTV' && product != 'NMD' && product != 'NST') && timesGoneBack < 15) {
                    // error checking - if nothing exists for this date, fetch the directory listing for the previous day
                    var d = curTime;
                    d.setDate(d.getDate() - 1);
                    timesGoneBack++;
                    getLatestL3(station, product, index, callback, d);
                } else {
                    callback(null);
                }
            }
        })
    } else {
        var fileUrl = `https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/DS.${product}/SI.${station.toLowerCase()}/sn.last#`
        callback(fileUrl);
    }

    /*
    * Below is all unused code to retrieve the latest file from a different data source.
    */
    // var curTime = new Date();
    // var year = curTime.getUTCFullYear();
    // var month = curTime.getUTCMonth() + 1;
    // if (month.toString().length == 1) month = "0" + month.toString();
    // var day = curTime.getUTCDate();
    // if (day.toString().length == 1) day = "0" + day.toString();
    // var yyyymmdd = `${year}${month}${day}`
    // var l3FileURL = `https://unidata3.ssec.wisc.edu/native/radar/level3/nexrad/${product}/${station}/${yyyymmdd}/`;
    // console.log(l3FileURL);
    // $.get(ut.phpProxy + l3FileURL, function(data) {
    //     var div = document.createElement('div')
    //     div.innerHTML = data;
    //     var jsonWithFileList = JSON.parse(ut.html2json(div));
    //     var fileListLength = jsonWithFileList.children[2].children.length;
    //     var filenameKey = jsonWithFileList.children[2].children[fileListLength - 2].attributes[0][1];

    //     var finishedURL = `${l3FileURL}${filenameKey}`;
    //     callback(finishedURL);
    // })
}

module.exports = {
    file_to_buffer,
    get_latest_level_2_url,
    get_latest_level_3_url
};