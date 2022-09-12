var map = require('../map');
const loaders = require('../../loaders');
const ut = require('../../utils');
const createControl = require('./createControl');
const tilts = require('../../menu/tilts');
const getStationStatus = require('../../misc/getStationStatus');
const isMobile = require('../../misc/detectmobilebrowser');

const blueColor = 'rgb(0, 157, 255)';
const redColor = 'rgb(255, 78, 78)';

function stationStatusColor() {
    getStationStatus(function (data) {
        $('.customMarker').each(function () {
            if (data[this.innerHTML].status == 'down') {
                $(this).css('background-color', redColor);
            }
        })
    })
}

var multiPointGeojson = {
    "type": "FeatureCollection",
    "features": []
}
function pushNewPoint(coords, properties) {
    var objToPush = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": coords
        },
        "properties": properties
    }
    multiPointGeojson.features.push(objToPush)
}

var statMarkerArr = [];
function showStations() {
    $.getJSON('https://steepatticstairs.github.io/AtticRadar/resources/radarStations.json', function (data) {
        var allKeys = Object.keys(data);
        for (key in allKeys) {
            var curIter = data[allKeys[key]];
            var curStat = allKeys[key];
            // generate station abbreviation json
            // statObj[curStat.slice(1)] = curStat;

            // check if it is an unsupported radar
            if (curStat.length == 4 && curStat.charAt(0) != 'T') {
                pushNewPoint([curIter[2], curIter[1]], {
                    'station': curStat
                });
                // // create a HTML element for each feature
                // var el = document.createElement('div');
                // el.className = 'customMarker';
                // el.innerHTML = curStat;

                // // make a marker for each feature and add to the map
                // var mark = new mapboxgl.Marker(el)
                //     .setLngLat([curIter[2], curIter[1]])
                //     .addTo(map);
                // statMarkerArr.push(mark)
            }
        }
        console.log(multiPointGeojson)

        // https://stackoverflow.com/a/63995053/18758797
        var fHover = null;
        map.loadImage(
            'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
            (error, image) => {
                if (error) throw error;
                map.addImage('custom-marker', image);
                map.addSource('stationSymbolLayer', {
                    'type': 'geojson',
                    'generateId': true,
                    'data': multiPointGeojson
                });

                // Add a symbol layer
                map.addLayer({
                    'id': 'stationSymbolLayer',
                    'type': 'symbol',
                    'source': 'stationSymbolLayer',
                    'layout': {
                        //'icon-image': 'custom-marker',
                        // get the title name from the source's "title" property
                        'text-field': ['get', 'station'],
                        'text-size': 13,
                        'text-font': [
                            //'Open Sans Semibold',
                            'Arial Unicode MS Bold'
                        ],
                        //'text-offset': [0, 1.25],
                        //'text-anchor': 'top'
                    },
                    'paint': {
                        //'text-color': 'white',
                        'text-color': [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false],
                            'rgb(190, 190, 190)',
                            'white'
                        ]
                    }
                });
            }
        );

        if (!isMobile) {
            map.on('mouseover', 'stationSymbolLayer', function (e) {
                fHover = e.features[0];
                map.getCanvas().style.cursor = 'pointer';
                map.setFeatureState({
                    source: 'stationSymbolLayer',
                    id: fHover.id
                }, {
                    hover: true
                });
            });

            map.on('mouseout', 'stationSymbolLayer', function (e) {
                if (!fHover) return;
                map.getCanvas().style.cursor = 'default';
                map.setFeatureState({
                    source: 'stationSymbolLayer',
                    id: fHover.id
                }, {
                    hover: false
                });
                fHover = null;
            });
        }

        map.on('click', 'stationSymbolLayer', function (e) {
            var clickedStation = e.features[0].properties.station;

            if (!$('#dataDiv').data('fromFileUpload')) {
                if (!$('#dataDiv').data('isFileUpload')/* && $(this).css('background-color') != redColor*/) {
                    // remove all other blue
                    $('.customMarker').each(function () {
                        if ($(this).css('background-color') == blueColor) {
                            $(this).css('background-color', 'rgb(136, 136, 136)');
                        }
                    })
                    $('#dataDiv').data('blueStationMarker', clickedStation);
                    // change background to blue
                    $(this).css('background-color', blueColor);
                    $('#stationInp').val(clickedStation);

                    tilts.resetTilts();
                    tilts.listTilts(ut.numOfTiltsObj['ref']);

                    $('#dataDiv').data('curProd', 'ref');

                    ut.progressBarVal('set', 0);

                    ut.disableModeBtn();

                    loaders.getLatestFile(clickedStation, [3, 'N0B', 0], function (url) {
                        console.log(url);
                        loaders.loadFileObject(ut.phpProxy + url, 3);
                    })
                }
            }
        })
    }).then(function () {
        stationStatusColor();

        $('.customMarker').each(function () {
            if (this.innerHTML == $('#dataDiv').data('blueStationMarker')) {
                $(this).css('background-color', blueColor);
            }
        })
    })
}

// createControl({
//     'id': 'stationThing',
//     'class': 'stationBtn',
//     'position': 'top-left',
//     'icon': 'fa-satellite-dish',
//     'css': 'margin-top: 100%;'
// }, function() {
//     if (!$('#stationThing').hasClass('icon-selected')) {
//         $('#stationThing').addClass('icon-selected');
//         $('#stationThing').removeClass('icon-black');
//         showStations();
//     } else if ($('#stationThing').hasClass('icon-selected')) {
//         $('#stationThing').removeClass('icon-selected');
//         $('#stationThing').addClass('icon-black');
//         for (key in statMarkerArr) {
//             statMarkerArr[key].remove();
//         }
//     }
// })

// setTimeout(function() {
//     $('#stationThing').addClass('icon-selected');
//     $('#stationThing').removeClass('icon-black');
//     showStations();
// }, 200)

module.exports = showStations;