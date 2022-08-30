const mapFuncs = require('./map/mapFunctions');
const ut = require('./utils');

/**
* Function to load a radar plot onto the map from a URL.
*
* @param {any} url - The location to the file. This can be a relative path, or a URL
to a file hosted on a server.
* @param {any} level - What level file this is. This is a temporary parameter, it will be
removed when level detection is added. Use 2 for level 2, 3 for level 3, OR 22 for a level 2
file where you only want to load the first chunk of the file (reflectivity data) for a quicker
loading speed.
*/
function loadFileObject(url, level) {
    url = ut.preventFileCaching(url);

    ut.progressBarVal('show');
    var radLevel;
    var wholeOrPart = 'whole';
    if (level == 2) {
        radLevel = 2;
    } if (level == 22) {
        radLevel = 2;
        wholeOrPart = 'part';
    } else if (level == 3) {
        radLevel = 3;
    }
    console.log('Fetch initialized - data requested');
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.addEventListener('load', function () {
        console.log('File finished downloading');
        var response = xhr.response;
        var blob;

        if (level != 2) {
            /*
            this block of code is an attempt to catch a level 3 file where the data doesn't
            start until 11 bytes out. This will detect if the first four bytes are "SDUS"
            (something like SDUS32) and if they are not, remove the first 11 bytes
            (the first 11 bytes are the bytes that should be removed to allow the parser to work)
            */
            // store the first eleven bytes for checking
            var fileEarlyBytes = ut.blobToString(response.slice(0, 11));
            // if the first four bytes are not "SDUS"
            if (fileEarlyBytes.slice(0, 4) != "SDUS") {
                // remove those pesky 11 bytes!
                blob = response.slice(11);
            } else {
                // the file is fine, proceed as normal
                blob = response;
            }
        } else {
            blob = response;
        }

        blob.lastModifiedDate = new Date();
        blob.name = url;
        // Create the event
        var event = new CustomEvent("loadFile", {
            "detail": [
                blob,
                radLevel,
                wholeOrPart
            ]
        });
        // Dispatch/Trigger/Fire the event
        document.dispatchEvent(event);
    });
    xhr.onprogress = (event) => {
        // event.loaded returns how many bytes are downloaded
        // event.total returns the total number of bytes
        // event.total is only available if server sends `Content-Length` header
        //console.log(`%c Downloaded ${ut.formatBytes(event.loaded)} of ${ut.formatBytes(event.total)}`, 'color: #bada55');
        //var complete = (event.loaded / event.total * 50 | 0);
        console.log(`${ut.formatBytes(event.loaded)}`);
        ut.progressBarVal('label', ut.formatBytes(event.loaded));
        ut.progressBarVal('set', parseInt(ut.formatBytes(event.loaded)) / 10);
    }
    xhr.send();
}

/**
* Sub-function to get the latest Level 2 file for a station. This should not be used by itself,
* rather it should be called from the main function getLatestFile().
*
* @param {any} station - The four letter ICAO of the station. e.g. "KLWX" / "KMHX"
* @param {any} callback - The function to run after the retrieval. Use a single variable
in this function, this will be a string with the latest file's URL.
*/
function getLatestL2(station, callback) {
    //document.getElementById('spinnerParent').style.display = 'block';
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
* Sub-function to get the latest Level 3 file for a station. This should not be used by itself,
* rather it should be called from the main function getLatestFile().
*
* @param {any} station - The four letter ICAO of the station. e.g. "KLWX" / "KMHX"
* @param {any} product - Three letter abbreviation of the Level 3 product being retrieved. e.g. "NST", "N0B", "N0G"
* @param {any} index - A number. This represents the time of the file to load. e.g. 0 for the latest file, 5 for 5 files back, etc.
* @param {any} callback - The function to run after the retrieval. Use a single variable
in this function, this will be a string with the latest file's URL.
*/
function getLatestL3(station, product, index, callback) {
    if (!(product.length > 3)) {
        //document.getElementById('spinnerParent').style.display = 'block';
        var curTime = new Date();
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
        console.log(fullURL)
        $.get(ut.phpProxy + fullURL, function (data) {
            var dataToWorkWith = JSON.stringify(ut.xmlToJson(data)).replace(/#/g, 'HASH')
            dataToWorkWith = JSON.parse(dataToWorkWith)
            //console.log(dataToWorkWith)
            var contentsBase = dataToWorkWith.ListBucketResult.Contents;
            var filenameKey = contentsBase[contentsBase.length - (index + 1)].Key.HASHtext;

            var finishedURL = `${urlBase}${filenameKey}`;
            callback(finishedURL);
        })
    } else {
        var fileUrl = `https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/DS.${product}/SI.${$('#stationInp').val().toLowerCase()}/sn.last`
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

/**
* Fetches the filename of the latest file for a given station.
*
* @param {any} station - The four letter ICAO of the station. e.g. "KLWX" / "KMHX"
* @param {any} levelProduct - This parameter is an object that specifies if the user is
retrieving a level 2 file (use 2 for this parameter), or a level 3 file (in that case,
use an array with three values, specifying the level (3), the product you want to retrieve, 
e.g. [3, "NST"], and a number that represents the time of the file to load. e.g. 0 for the latest file,
5 for 5 files back, etc.)
* @param {any} callback - The function to run after the retrieval. Use a single variable
in this function, this will be a string with the latest file's URL.
*/
function getLatestFile(station, levelProduct, callback) {
    ut.progressBarVal('show');
    // obviously, the user wants a level 2 file
    if (levelProduct == 2) {
        getLatestL2(station, function (url) {
            callback(url);
        })
    } else {
        // assume this is a level 3 file - and fail if it is not an array
        if (!Array.isArray(levelProduct)) {
            throw new Error('You must provide an array for a level 3 product/level parameter.');
        }
        const product = levelProduct[1];
        const fileIndex = levelProduct[2];
        /* we need to slice(1) here (remove the first letter) because the level 3 source we
        * are using only accepts a three character ICAO, e.g. "MHX" / "LWX" */
        getLatestL3(station.slice(1), product, fileIndex, function (url) {
            callback(url);
        })
    }
};

module.exports = {
    loadFileObject,
    getLatestFile
}