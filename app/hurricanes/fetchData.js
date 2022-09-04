const unzipKMZ = require('./unzip');
const ut = require('../radar/utils');

// https://www.nhc.noaa.gov/storm_graphics/api/AL052022_CONE_latest.kmz
// https://www.nhc.noaa.gov/storm_graphics/api/AL052022_TRACK_latest.kmz
// https://www.nhc.noaa.gov/gis/
// https://www.nhc.noaa.gov/aboutrss.shtml

$('#dataDiv').data('indexOfDrawnHurricane', []);
$('#dataDiv').data('hurricaneMapLayers', []);

// var url = '../../data/kmz/AL052022_TRACK_latest.kmz';
// var type = 'track';
var layersToLoad = []
function loadHurricanesFromID(ids) {
    for (var i = 0; i < ids.length; i++) {
        layersToLoad.push([ut.preventFileCaching(`https://www.nhc.noaa.gov/storm_graphics/api/${ids[i]}_CONE_latest.kmz`), 'cone']);
        layersToLoad.push([ut.preventFileCaching(`https://www.nhc.noaa.gov/storm_graphics/api/${ids[i]}_TRACK_latest.kmz`), 'track']);
    }
    for (var i = 0; i < layersToLoad.length; i++) {
        loadHurricaneFromFile(layersToLoad[i][0], layersToLoad[i][1], i)
    }
}

function loadHurricaneFromFile(url, type, index) {
    if (url.startsWith("https")) {
        url = ut.phpProxy + url;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.addEventListener('load', function () {
        var response = xhr.response;
        var blob = response;

        blob.lastModifiedDate = new Date();
        blob.name = url;

        unzipKMZ(blob, type, index);
    });
    xhr.send();
}

function ifExists(jsonData, num) {
    if (jsonData.rss.channel.item.hasOwnProperty(num)) {
        if (jsonData.rss.channel.item[num].hasOwnProperty('nhc:Cyclone')) {
            return jsonData.rss.channel.item[num]['nhc:Cyclone']['nhc:atcf']['#text'];
        } else {
            return false;
        }
    } else {
        return false;
    }
}

var namesArr = [];
$.get(ut.preventFileCaching(ut.phpProxy + 'https://www.nhc.noaa.gov/index-at.xml'), function (data) {
    var jsonData = ut.xmlToJson(data);
    for (var n = 0; n < 20; n++) {
        var existsIndex = ifExists(jsonData, n);
        if (existsIndex != false) {
            namesArr.push(existsIndex);
        }
    }

    $.get(ut.phpProxy + ut.preventFileCaching('https://www.nhc.noaa.gov/index-ep.xml'), function (data) {
        var jsonData = ut.xmlToJson(data);
        for (var n = 0; n < 20; n++) {
            var existsIndex = ifExists(jsonData, n);
            if (existsIndex != false) {
                namesArr.push(existsIndex);
            }
        }

        $.get(ut.phpProxy + ut.preventFileCaching('https://www.nhc.noaa.gov/index-cp.xml'), function (data) {
            var jsonData = ut.xmlToJson(data);
            for (var n = 0; n < 20; n++) {
                var existsIndex = ifExists(jsonData, n);
                if (existsIndex != false) {
                    namesArr.push(existsIndex);
                }
            }

            $('#dataDiv').data('allHurricanesPlotted', namesArr);
            loadHurricanesFromID(namesArr);
        })
    })
})