const unzipKMZ = require('./unzip');
const ut = require('../radar/utils');

// https://www.nhc.noaa.gov/storm_graphics/api/AL052022_CONE_latest.kmz
// https://www.nhc.noaa.gov/storm_graphics/api/AL052022_TRACK_latest.kmz
// https://www.nhc.noaa.gov/gis/

// var url = '../../data/kmz/AL052022_TRACK_latest.kmz';
// var type = 'track';
var layersToLoad = [
    //['../../data/kmz/AL052022_CONE_latest.kmz', 'cone'],
    //['../../data/kmz/AL052022_TRACK_latest.kmz', 'track']
]
for (var i = 0; i < layersToLoad.length; i++) {
    loadHurricaneFromFile(layersToLoad[i][0], layersToLoad[i][1])
}

function loadHurricaneFromFile(url, type) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.addEventListener('load', function () {
        var response = xhr.response;
        var blob = response;

        blob.lastModifiedDate = new Date();
        blob.name = url;

        unzipKMZ(blob, type);
    });
    xhr.send();
}