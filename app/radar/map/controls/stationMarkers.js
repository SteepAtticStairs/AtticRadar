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


function mouseOver(e) {
    if ($('#dataDiv').data('blueStations') != e.features[0].id) {
        fHover = e.features[0];
        map.getCanvas().style.cursor = 'pointer';
        map.setFeatureState({
            source: 'stationSymbolLayer',
            id: fHover.id
        }, {
            hover: true,
            color: 1,
            isClicked: false,
        });
    }
}
function mouseOut(e) {
    if (!fHover) return;
    if ($('#dataDiv').data('blueStations') != fHover.id) {
        map.getCanvas().style.cursor = 'default';
        map.setFeatureState({
            source: 'stationSymbolLayer',
            id: fHover.id
        }, {
            hover: false,
            color: 2,
            isClicked: false,
        });
        fHover = null;
    }
}

function enableMouseListeners() {
    map.on('mouseover', 'stationSymbolLayer', mouseOver);
    map.on('mouseout', 'stationSymbolLayer', mouseOut);
}
function disableMouseListeners() {
    map.off('mouseover', 'stationSymbolLayer', mouseOver);
    map.off('mouseout', 'stationSymbolLayer', mouseOut);
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
        map.on('load', function (e) {
            map.loadImage(
                'https://steepatticstairs.github.io/AtticRadar/resources/roundedRectangle.png',
                (error, image) => {
                    if (error) throw error;
                    map.addImage('custom-marker', image, {
                        "sdf": "true"
                    });
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
                            'icon-image': 'custom-marker',
                            'icon-size': 0.07,
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
                        //['==', ['case', ['feature-state', 'color'], 1]],
                        //'rgb(136, 136, 136)',
                        //['==', ['case', ['feature-state', 'color'], 2]],
                        //'rgb(200, 200, 200)',
                        //['==', ['case', ['feature-state', 'color'], 3]],
                        //blueColor
                        'paint': {
                            //'text-color': 'white',
                            'text-color': 'black',
                            'icon-color': [
                                'case',
                                ['==', ['feature-state', 'color'], 3],
                                blueColor,
                                ['==', ['feature-state', 'color'], 1],
                                'rgb(136, 136, 136)',
                                ['==', ['feature-state', 'color'], 2],
                                'rgb(200, 200, 200)',
                                'rgb(200, 200, 200)'
                            ]
                        }
                    });
                }
            );
        });

        if (!isMobile) {
            enableMouseListeners();
        }

        map.on('click', 'stationSymbolLayer', function (e) {
            if ($('#dataDiv').data('blueStations') != e.features[0].id) {
                var clickedStation = e.features[0].properties.station;
                var id = e.features[0].id;

                // change other blue station background to normal
                map.setFeatureState({
                    source: 'stationSymbolLayer',
                    id: $('#dataDiv').data('blueStations')
                }, {
                    hover: false,
                    color: 2,
                    isClicked: true,
                });

                $('#dataDiv').data('blueStations', id);

                disableMouseListeners();

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
                        map.setFeatureState({
                            source: 'stationSymbolLayer',
                            id: e.features[0].id
                        }, {
                            hover: false,
                            color: 3,
                            isClicked: true,
                        });
                        enableMouseListeners();

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