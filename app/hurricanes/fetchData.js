const unzipKMZ = require('./unzip');
const ut = require('../radar/utils');
const display_attic_dialog = require('../core/menu/attic_dialog');
const drawHurricanesToMap = require('./drawToMap');
const loadOutlooks = require('./loadOutlooks');
const stormTypeData = require('./stormTypeData');
const chroma = require('chroma-js');
const { DateTime } = require('luxon');
var map = require('../core/map/map');

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
            layersToLoad.push([ut.preventFileCaching(`https://www.nhc.noaa.gov/storm_graphics/api/${ids[i]}_CONE_latest.kmz#`), 'cone', ids[i]]);
            layersToLoad.push([ut.preventFileCaching(`https://www.nhc.noaa.gov/storm_graphics/api/${ids[i]}_TRACK_latest.kmz#`), 'track', ids[i]]);
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

            unzipKMZ(blob, hurricaneID, function(geoJsonObject) {
                drawHurricanesToMap(geoJsonObject, type, index, hurricaneID);
            });
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

    loadOutlooks();

    var fetchTime = new Date();
    fetchTime.setSeconds(0);
    //fetchTime.setSeconds(fetchTime.getSeconds() - Math.round(Math.random() * 10))
    var namesArr = [];
    //var checkingIters = 50;
    var activeStormsURL = ut.preventFileCaching(ut.phpProxy + 'https://www.nhc.noaa.gov/CurrentStorms.json#');
    $.getJSON(activeStormsURL, function(data) {
        var length = data.activeStorms.length;
        if (length == 0) {
            $('#hurricanesMenuItemIcon').removeClass('icon-blue');
            $('#hurricanesMenuItemIcon').addClass('icon-grey');

            var nowTime = new Date();
            if (nowTime.getSeconds() == 0) { nowTime.setSeconds(1) }
            const dateDiff = ut.getDateDiff(fetchTime, nowTime);
            var formattedDateDiff;
            if (dateDiff.s) { formattedDateDiff = `${dateDiff.s}s`; }
            if (dateDiff.m) { formattedDateDiff = `${dateDiff.m}m ${dateDiff.s}s`; }

            var headerColor = '#ba3043';
            var body = `\
            <h5 style='text-align: center'>There are <b class='alertTextDescriber'>no active Tropical Cyclones</b> in the Atlantic, East Pacific, or West Pacific basins.</h5>
            <div style='text-align: center'>Updated: ${DateTime.now().toFormat('L/d/yyyy h:mm a ZZZZ')} <b>(${formattedDateDiff} ago)</b></div><br>`

            display_attic_dialog({
                'title': 'No Active Systems',
                'body': body,
                'color': headerColor,
                'textColor': chroma(headerColor).luminance() > 0.4 ? 'black' : 'white',
            })
        }
        function activeStormsLoop(n) {
            if (n < length) {
                var stormID = data.activeStorms[n].id;
                stormID = stormID.toUpperCase();
                console.log('Found hurricane ' + stormID);
                namesArr.push(stormID);
                $('#dataDiv').data(`${stormID}_miscData`, {
                    'lastUpdate': data.activeStorms[n].lastUpdate,
                    'advisoryNum': data.activeStorms[n].publicAdvisory.advNum
                });
                stormTypeData(stormID, function(data) {
                    console.log(stormID, data)
                    $('#dataDiv').data(`${stormID}_hurricaneTypeData`, data);
                    n++;
                    activeStormsLoop(n);
                })
            } else {
                $('#dataDiv').data('allHurricanesPlotted', namesArr);
                loadHurricanesFromID(namesArr);
            }
        }
        activeStormsLoop(0);
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