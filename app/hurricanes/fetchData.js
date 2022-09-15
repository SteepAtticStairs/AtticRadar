const unzipKMZ = require('./unzip');
const ut = require('../radar/utils');
var map = require('../radar/map/map');

// https://www.nhc.noaa.gov/storm_graphics/api/AL052022_CONE_latest.kmz
// https://www.nhc.noaa.gov/storm_graphics/api/AL052022_TRACK_latest.kmz
// https://www.nhc.noaa.gov/gis/
// https://www.nhc.noaa.gov/aboutrss.shtml

// https://www.nrlmry.navy.mil/atcf_web/docs/database/new/database.html
// https://www.nrlmry.navy.mil/atcf_web/docs/current_storms/

// https://github.com/weather-gov/api/discussions/569

$('#dataDiv').data('indexOfDrawnHurricane', []);
$('#dataDiv').data('hurricaneMapLayers', []);

function exportFetchData() {
    // var url = '../../data/kmz/AL052022_TRACK_latest.kmz';
    // var type = 'track';
    var layersToLoad = []
    function loadHurricanesFromID(ids) {
        for (var i = 0; i < ids.length; i++) {
            layersToLoad.push([ut.preventFileCaching(`https://www.nhc.noaa.gov/storm_graphics/api/${ids[i]}_CONE_latest.kmz`), 'cone', ids[i]]);
            layersToLoad.push([ut.preventFileCaching(`https://www.nhc.noaa.gov/storm_graphics/api/${ids[i]}_TRACK_latest.kmz`), 'track', ids[i]]);
            // $.get(ut.phpProxy + `https://ftp.nhc.noaa.gov/atcf/cxml/${ids[i].toLowerCase()}_cxml.xml`, function(data) {
            //     var json = ut.xmlToJson(data);
            //     for (var item in json.cxml.data.disturbance.fix) {
            //         var lat = json.cxml.data.disturbance.fix[item].latitude['#text'];
            //         var lon = json.cxml.data.disturbance.fix[item].longitude['#text'];
            //         new mapboxgl.Marker()
            //             .setLngLat([lon, lat])
            //             .addTo(map);
            //     }
            // })
        }
        for (var i = 0; i < layersToLoad.length; i++) {
            loadHurricaneFromFile(layersToLoad[i][0], layersToLoad[i][1], i, layersToLoad[i][2])
        }
    }

    function loadHurricaneFromFile(url, type, index, hurricaneID) {
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

            unzipKMZ(blob, type, index, hurricaneID);
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
    //var checkingIters = 50;
    $.getJSON(ut.preventFileCaching(ut.phpProxy + 'https://www.nhc.noaa.gov/CurrentStorms.json'), function(data) {
        for (var item in data.activeStorms) {
            var stormID = data.activeStorms[item].id;
            stormID = stormID.toUpperCase();
            console.log('Found hurricane ' + stormID);
            namesArr.push(stormID);
        }
        $('#dataDiv').data('allHurricanesPlotted', namesArr);
        loadHurricanesFromID(namesArr);
    })
    // $.get(ut.preventFileCaching(ut.phpProxy + 'https://www.nhc.noaa.gov/index-at.xml'), function (data) {
    //     var jsonData = ut.xmlToJson(data);
    //     for (var n = 0; n < checkingIters; n++) {
    //         var existsIndex = ifExists(jsonData, n);
    //         if (existsIndex != false) {
    //             console.log('Found hurricane ' + existsIndex);
    //             namesArr.push(existsIndex);
    //         }
    //     }

    //     $.get(ut.phpProxy + ut.preventFileCaching('https://www.nhc.noaa.gov/index-ep.xml'), function (data) {
    //         var jsonData = ut.xmlToJson(data);
    //         for (var n = 0; n < checkingIters; n++) {
    //             var existsIndex = ifExists(jsonData, n);
    //             if (existsIndex != false) {
    //                 console.log('Found hurricane ' + existsIndex);
    //                 namesArr.push(existsIndex);
    //             }
    //         }

    //         $.get(ut.phpProxy + ut.preventFileCaching('https://www.nhc.noaa.gov/index-cp.xml'), function (data) {
    //             var jsonData = ut.xmlToJson(data);
    //             for (var n = 0; n < checkingIters; n++) {
    //                 var existsIndex = ifExists(jsonData, n);
    //                 if (existsIndex != false) {
    //                     console.log('Found hurricane ' + existsIndex);
    //                     namesArr.push(existsIndex);
    //                 }
    //             }

    //             $('#dataDiv').data('allHurricanesPlotted', namesArr);
    //             loadHurricanesFromID(namesArr);
    //         })
    //     })
    // })
}

module.exports = exportFetchData;