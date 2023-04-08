const turf = require('@turf/turf');
const ut = require('../utils');
const map = require('../map/map');
const get_station_status = require('../misc/getStationStatus');

const NEXRADLevel2File = require('../libnexrad/level2/level2_parser');
const Level2Factory = require('../libnexrad/level2/level2_factory');

const NEXRADLevel3File = require('../libnexrad/level3/level3_parser');
const Level3Factory = require('../libnexrad/level3/level3_factory');

const loaders_nexrad = require('../libnexrad/loaders_nexrad');
const nexrad_locations = require('../libnexrad/nexrad_locations').NEXRAD_LOCATIONS;

function _copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Helper function that generates a geojson object from a simple object with radar station data.
 * 
 * @param {Object} status_info OPTIONAL - An object containing the status of each radar station, from the "get_station_status" function.
 * @returns {Object} A geojson object containing the radar station data.
 */
function _generate_stations_geojson(status_info = null) {
    var points = [];
    for (var station in nexrad_locations) {
        if (nexrad_locations[station].type == 'WSR-88D' || nexrad_locations[station].type == 'TDWR') {
            const lat = nexrad_locations[station].lat;
            const lon = nexrad_locations[station].lon;

            const station_properties = _copy(nexrad_locations[station]);
            station_properties.station_id = station;
            if (status_info != null) {
                station_properties.status = status_info[station].status;
            }

            const point = turf.point([lon, lat], station_properties);
            points.push(point);
        }
    }
    const feature_collection = turf.featureCollection(points);
    return feature_collection;
}

/**
 * Helper function that adds the radar station layer to the map.
 * 
 * @param {Object} radar_stations_geojson A geojson object containing the radar station data. Comes from the "_generate_stations_geojson" function.
 * @param {Function} callback A callback function.
 */
function _add_stations_layer(radar_stations_geojson, callback) {
    const blueColor = 'rgb(0, 157, 255)';
    const redColor = 'rgb(255, 78, 78)';
    const orangeColor = 'rgb(176, 128, 26)';
    const standardColor = 'rgb(200, 200, 200)';

    map.on('load', function (e) {
        map.loadImage(
            './resources/roundedRectangle.png',
            (error, image) => {
                if (error) throw error;
                map.addImage('custom-marker', image, {
                    "sdf": "true"
                });
                map.addSource('stationSymbolLayer', {
                    'type': 'geojson',
                    'generateId': true,
                    'data': radar_stations_geojson
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
                        'text-field': ['get', 'station_id'],
                        'text-size': 13,
                        'text-font': [
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
                        'text-color': 'black',
                        'icon-color': [
                            'case',
                            // ['==', ['feature-state', 'color'], 3],
                            // blueColor,
                            ['==', ['get', 'status'], 'down'],
                            redColor,
                            ['==', ['get', 'type'], 'TDWR'],
                            orangeColor,
                            // ['==', ['feature-state', 'color'], 1],
                            // 'rgb(136, 136, 136)',
                            // ['==', ['feature-state', 'color'], 2],
                            // 'rgb(200, 200, 200)',
                            standardColor
                        ]
                    }
                });

                get_station_status((data) => {
                    const statusified_geojson = _generate_stations_geojson(data);
                    map.getSource('stationSymbolLayer').setData(statusified_geojson);
                })

                callback();
            }
        );
    });
}

/**
 * Code that executes when the mouse enters a station's bubble
 */
function mouse_over() {
    map.getCanvas().style.cursor = 'pointer';
}
/**
 * Code that executes when the mouse leaves a station's bubble
 */
function mouse_out() {
    map.getCanvas().style.cursor = '';
}

/**
 * Function that enables all mouse-related event listeners for the radar station layer
 */
function _enable_mouse_listeners() {
    map.on('mouseover', 'stationSymbolLayer', mouse_over);
    map.on('mouseout', 'stationSymbolLayer', mouse_out);
}
/**
 * Function that disables all mouse-related event listeners for the radar station layer
 */
function _disable_mouse_listeners() {
    map.off('mouseover', 'stationSymbolLayer', mouse_over);
    map.off('mouseout', 'stationSymbolLayer', mouse_out);
}

/**
 * Initialize the mouse listeners for the first time.
 */
function _init_mouse_listeners() {
    _enable_mouse_listeners();
}
/**
 * Initialize the click listener for the first time.
 */
function _init_click_listener() {
    map.on('click', 'stationSymbolLayer', (e) => {
        const base = e.features[0].properties;
        const clickedStation = base.station_id;
        window.atticData.currentStation = clickedStation;
        const stationType = base.type;

        var productToLoad;
        var abbvProductToLoad;
        if (stationType == 'WSR-88D') {
            $('#wsr88d_psm').show();
            $('#tdwr_psm').hide();

            productToLoad = 'N0B';
            abbvProductToLoad = 'ref';
            // $(`.productOption[value="${abbvProductToLoad}"]`).html()
            $('#productsDropdownTriggerText').html(window.longProductNames[abbvProductToLoad]);
        } else if (stationType == 'TDWR') {
            $('#wsr88d_psm').hide();
            $('#tdwr_psm').show();
            $('#productsDropdownTriggerText').html($(`.productOption[value="${abbvProductToLoad}"]`).html());

            productToLoad = 'TZ0';
            abbvProductToLoad = 'sr-ref';
            // $(`.productOption[value="${abbvProductToLoad}"]`).html()
            $('#productsDropdownTriggerText').html(window.longProductNames[abbvProductToLoad]);
        }

        $('#radarInfoSpan').show();

        loaders_nexrad.get_latest_level_3_url(clickedStation, productToLoad, 0, function(url) {
            loaders_nexrad.file_to_buffer(ut.phpProxy + url, function(buffer) {
                const file = new NEXRADLevel3File(buffer);
                const L3Factory = new Level3Factory(file);
                L3Factory.plot();
            })
        })
    });
}


/**
 * Main function.
 */
function showStations() {
    const radar_stations_geojson = _generate_stations_geojson();

    _add_stations_layer(radar_stations_geojson, () => {
        _init_mouse_listeners();
        _init_click_listener();
    });
}

module.exports = showStations;

// var map = require('../map/map');
// const loaders = require('../loaders');
// const ut = require('../utils');
// const tilts = require('../menu/tilts');
// const getStationStatus = require('../misc/getStationStatus');
// const isMobile = require('../misc/detectmobilebrowser');

// const radarStations = require('../../../resources/radarStations');
// const radarStationInfo = require('../radar-message/radarStationInfo');

// const fetchMETARData = require('../../metars/fetchData');

// const blueColor = 'rgb(0, 157, 255)';
// const redColor = 'rgb(255, 78, 78)';
// const orangeColor = 'rgb(176, 128, 26)';

// $('#dataDiv').data('blueStations', null)

// function stationStatusColor() {
//     getStationStatus(function (data) {
//         const statusifiedGeojson = returnStationsGeojson(data);
//         map.getSource('stationSymbolLayer').setData(statusifiedGeojson);
//     })
// }

// var multiPointGeojson = {
//     "type": "FeatureCollection",
//     "features": []
// }
// function pushNewPoint(coords, properties) {
//     var objToPush = {
//         "type": "Feature",
//         "geometry": {
//             "type": "Point",
//             "coordinates": coords
//         },
//         "properties": properties
//     }
//     multiPointGeojson.features.push(objToPush)
// }


// function mouseOver(e) {
//     if ($('#dataDiv').data('blueStations') != e.features[0].id/* && e.features[0].properties.status != 'down'*/) {
//         fHover = e.features[0];
//         map.getCanvas().style.cursor = 'pointer';
//         map.setFeatureState({
//             source: 'stationSymbolLayer',
//             id: fHover.id
//         }, {
//             hover: true,
//             color: 1,
//             isClicked: false,
//         });
//     }
// }
// function mouseOut(e) {
//     if (!fHover) return;
//     if ($('#dataDiv').data('blueStations') != fHover.id/* && fHover.properties.status != 'down'*/) {
//         map.getCanvas().style.cursor = '';
//         map.setFeatureState({
//             source: 'stationSymbolLayer',
//             id: fHover.id
//         }, {
//             hover: false,
//             color: 2,
//             isClicked: false,
//         });
//         fHover = null;
//     }
// }

// function enableMouseListeners() {
//     map.on('mouseover', 'stationSymbolLayer', mouseOver);
//     map.on('mouseout', 'stationSymbolLayer', mouseOut);
// }
// function disableMouseListeners() {
//     map.off('mouseover', 'stationSymbolLayer', mouseOver);
//     map.off('mouseout', 'stationSymbolLayer', mouseOut);
// }

// function returnStationsGeojson(radarStatusData) {
//     multiPointGeojson = {
//         "type": "FeatureCollection",
//         "features": []
//     };

//     var allKeys = Object.keys(radarStations);
//     for (key in allKeys) {
//         var curIter = radarStations[allKeys[key]];
//         var curStat = allKeys[key];
//         // generate station abbreviation json
//         // statObj[curStat.slice(1)] = curStat;

//         function pushThePoint() {
//             var status;
//             if (radarStatusData != null) {
//                 var status = radarStatusData[curStat].status;
//             } else {
//                 status = null;
//             }
//             pushNewPoint([curIter[2], curIter[1]], {
//                 'station': curStat,
//                 'status': status,
//                 'type': radarStationInfo[curStat].type
//             });
//             // // create a HTML element for each feature
//             // var el = document.createElement('div');
//             // el.className = 'customMarker';
//             // el.innerHTML = curStat;

//             // // make a marker for each feature and add to the map
//             // var mark = new mapboxgl.Marker(el)
//             //     .setLngLat([curIter[2], curIter[1]])
//             //     .addTo(map);
//             // statMarkerArr.push(mark)
//         }

//         // check if it is an unsupported radar
//         if (curStat.length == 4/* && curStat.charAt(0) != 'T'*/) {
//             pushThePoint();
//         }
//         // puerto rico WSR-88D is fine, but the 'T' makes it look like a TDWR
//         // if (curStat == 'TJUA') {
//         //     pushThePoint();
//         // }
//     }
//     return multiPointGeojson;
// }

// var statMarkerArr = [];
// function showStations() {
//     const stationGeojson = returnStationsGeojson();

//     // https://stackoverflow.com/a/63995053/18758797
//     var fHover = null;
//     map.on('load', function (e) {
//         map.loadImage(
//             './resources/roundedRectangle.png',
//             (error, image) => {
//                 if (error) throw error;
//                 map.addImage('custom-marker', image, {
//                     "sdf": "true"
//                 });
//                 map.addSource('stationSymbolLayer', {
//                     'type': 'geojson',
//                     'generateId': true,
//                     'data': stationGeojson
//                 });

//                 // Add a symbol layer
//                 map.addLayer({
//                     'id': 'stationSymbolLayer',
//                     'type': 'symbol',
//                     'source': 'stationSymbolLayer',
//                     'layout': {
//                         'icon-image': 'custom-marker',
//                         'icon-size': 0.07,
//                         // get the title name from the source's "title" property
//                         'text-field': ['get', 'station'],
//                         'text-size': 13,
//                         'text-font': [
//                             //'Open Sans Semibold',
//                             'Arial Unicode MS Bold'
//                         ],
//                         //'text-offset': [0, 1.25],
//                         //'text-anchor': 'top'
//                     },
//                     //['==', ['case', ['feature-state', 'color'], 1]],
//                     //'rgb(136, 136, 136)',
//                     //['==', ['case', ['feature-state', 'color'], 2]],
//                     //'rgb(200, 200, 200)',
//                     //['==', ['case', ['feature-state', 'color'], 3]],
//                     //blueColor
//                     'paint': {
//                         //'text-color': 'white',
//                         'text-color': 'black',
//                         'icon-color': [
//                             'case',
//                             ['==', ['feature-state', 'color'], 3],
//                             blueColor,
//                             ['==', ['get', 'status'], 'down'],
//                             redColor,
//                             ['==', ['get', 'type'], 'TDWR'],
//                             orangeColor,
//                             ['==', ['feature-state', 'color'], 1],
//                             'rgb(136, 136, 136)',
//                             ['==', ['feature-state', 'color'], 2],
//                             'rgb(200, 200, 200)',
//                             'rgb(200, 200, 200)'
//                         ]
//                     }
//                 });
//                 stationStatusColor();
//             }
//         );
//     });

//     if (!isMobile) {
//         enableMouseListeners();
//     }

//     map.on('click', 'stationSymbolLayer', function (e) {
//         if ($('#dataDiv').data('blueStations') != e.features[0].id/* && e.features[0].properties.status != 'down'*/) {
//             if (!$('#dataDiv').data('fromFileUpload')) {
//                 if (!$('#dataDiv').data('isFileUpload')/* && $(this).css('background-color') != redColor*/) {
//                     var clickedStation = e.features[0].properties.station;
//                     var stationType = e.features[0].properties.type;
//                     var id = e.features[0].id;

//                     $(document).trigger('newStation', clickedStation);var alreadyClicked = false;

//                     var productToLoad;
//                     var abbvProductToLoad;
//                     if (stationType == 'WSR-88D') {
//                         $('#wsr88d_psm').show();
//                         $('#tdwr_psm').hide();

//                         productToLoad = 'N0B';
//                         abbvProductToLoad = 'ref';
//                         // $(`.productOption[value="${abbvProductToLoad}"]`).html()
//                         $('#productsDropdownTriggerText').html(window.longProductNames[abbvProductToLoad]);

//                         var menuElem = $('#wsr88dRefBtn');
//                         if (menuElem.find('.selectedProductMenuItem').length == 0) {
//                             var htmlContent = menuElem.html();
//                             $('.selectedProductMenuItem').remove();
//                             menuElem.html(`<i class="fa-solid fa-circle-check icon-green selectedProductMenuItem">&nbsp;&nbsp;</i>${htmlContent}`);
//                         }
//                     } else if (stationType == 'TDWR') {
//                         $('#wsr88d_psm').hide();
//                         $('#tdwr_psm').show();
//                         $('#productsDropdownTriggerText').html($(`.productOption[value="${abbvProductToLoad}"]`).html());

//                         productToLoad = 'TZ0';
//                         abbvProductToLoad = 'sr-ref';
//                         // $(`.productOption[value="${abbvProductToLoad}"]`).html()
//                         $('#productsDropdownTriggerText').html(window.longProductNames[abbvProductToLoad]);

//                         var menuElem = $('#tdwrRefBtn');
//                         if (menuElem.find('.selectedProductMenuItem').length == 0) {
//                             var htmlContent = menuElem.html();
//                             $('.selectedProductMenuItem').remove();
//                             menuElem.html(`<i class="fa-solid fa-circle-check icon-green selectedProductMenuItem">&nbsp;&nbsp;</i>${htmlContent}`);
//                         }
//                     }

//                     // change other blue station background to normal
//                     map.setFeatureState({
//                         source: 'stationSymbolLayer',
//                         id: $('#dataDiv').data('blueStations')
//                     }, {
//                         hover: false,
//                         color: 2,
//                         isClicked: true,
//                     });

//                     $('#dataDiv').data('blueStations', id);

//                     disableMouseListeners();

//                     // remove all other blue
//                     $('.customMarker').each(function () {
//                         if ($(this).css('background-color') == blueColor) {
//                             $(this).css('background-color', 'rgb(136, 136, 136)');
//                         }
//                     })
//                     $('#dataDiv').data('blueStationMarker', clickedStation);
//                     // change background to blue
//                     map.setFeatureState({
//                         source: 'stationSymbolLayer',
//                         id: e.features[0].id
//                     }, {
//                         hover: false,
//                         color: 3,
//                         isClicked: true,
//                     });
//                     enableMouseListeners();

//                     $('#stationInp').val(clickedStation);
//                     $('#dataDiv').data('currentStation', clickedStation);
//                     window.atticData.currentStation = clickedStation;

//                     $('#radarStationIcon').show();
//                     document.getElementById('radarStation').innerHTML = clickedStation;
//                     document.getElementById('radarLocation').innerHTML = radarStationInfo[clickedStation].name;
//                     $('#radarInfoSpan').show();

//                     if ($('#dataDiv').data('metarsActive')) {
//                         //fetchMETARData.fetchMETARData('update');
//                     }

//                     tilts.resetTilts();
//                     tilts.listTilts(ut.numOfTiltsObj[abbvProductToLoad]);
//                     $('#dataDiv').data('curProd', abbvProductToLoad);
//                     ut.progressBarVal('set', 0);
//                     ut.disableModeBtn();
//                     loaders.getLatestFile(clickedStation, [3, productToLoad, 0], function (url) {
//                         console.log(url);
//                         loaders.loadFileObject(ut.phpProxy + url + '#', 3);
//                     })
//                 }
//             }
//         }
//     })
// }

// // createControl({
// //     'id': 'stationThing',
// //     'class': 'stationBtn',
// //     'position': 'top-left',
// //     'icon': 'fa-satellite-dish',
// //     'css': 'margin-top: 100%;'
// // }, function() {
// //     if (!$('#stationThing').hasClass('icon-selected')) {
// //         $('#stationThing').addClass('icon-selected');
// //         $('#stationThing').removeClass('icon-black');
// //         showStations();
// //     } else if ($('#stationThing').hasClass('icon-selected')) {
// //         $('#stationThing').removeClass('icon-selected');
// //         $('#stationThing').addClass('icon-black');
// //         for (key in statMarkerArr) {
// //             statMarkerArr[key].remove();
// //         }
// //     }
// // })

// // setTimeout(function() {
// //     $('#stationThing').addClass('icon-selected');
// //     $('#stationThing').removeClass('icon-black');
// //     showStations();
// // }, 200)

// module.exports = showStations;\