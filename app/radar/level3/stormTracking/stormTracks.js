const ut = require('../../utils');
const mapFuncs = require('../../map/mapFunctions');
const getLevel3FileTime = require('../l3fileTime');
const radarStations = require('../../../../resources/radarStations');
const stationAbbreviations = require('../../../../resources/stationAbbreviations');
var map = require('../../map/map');

function parsePlotStormTracks(l3rad, theFileStation) {
    var stormTracksLayerArr = [];

    // for the storm track lines
    var multiLineStringGeojson = {
        "type": "MultiLineString",
        "coordinates": []
    }
    function pushNewMultiLineString(coords) {
        multiLineStringGeojson.coordinates.push(coords);
    }

    // for the circles on the line edges
    var linePointGeojson = {
        "type": "FeatureCollection",
        "features": []
    }
    function pushNewLinePoint(coords, properties) {
        // this allows you to add properties for each cell
        var objToPush = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": coords
            },
            "properties": properties
        }
        linePointGeojson.features.push(objToPush)
    }

    // for the red points for isolated cells
    var singlePointGeojson = {
        "type": "FeatureCollection",
        "features": []
    }
    function pushNewSinglePoint(coords, properties) {
        // this allows you to add properties for each cell
        var objToPush = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": coords
            },
            "properties": properties
        }
        singlePointGeojson.features.push(objToPush)
    }

    // for the blue points for the start of a storm track
    var mainLinePointGeojson = {
        "type": "FeatureCollection",
        "features": []
    }
    function pushNewMainLinePoint(coords, properties) {
        // this allows you to add properties for each cell
        var objToPush = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": coords
            },
            "properties": properties
        }
        mainLinePointGeojson.features.push(objToPush)
    }

    function cellClick(e) {
        var cellProperties = e.features[0].properties;
        if (cellProperties.movement != 'new') {
            cellProperties.movement = JSON.parse(cellProperties.movement);
        }
        cellProperties.coords = JSON.parse(cellProperties.coords);
        var cellTime = new Date(cellProperties.time);

        var minutesToAdd = [15, 30, 45, 60];
        if (cellProperties.index != undefined) {
            cellTime = ut.addMinutes(cellTime, minutesToAdd[parseInt(cellProperties.index)])
        }

        var hourMin = ut.printHourMin(cellTime, ut.userTimeZone);

        var popupHTML =
            `<div>Cell <b>${cellProperties.cellID}</b> at <b>${hourMin}</b></div>`

        function flip(num) {
            if (num >= 180) {
                return num - 180;
            } else if (num < 180) {
                return num + 180;
            }
        }

        if (cellProperties.movement != 'new') {
            popupHTML += `<div><b>${ut.degToCompass(flip(cellProperties.movement.deg))}</b> at <b>${ut.knotsToMph(cellProperties.movement.kts, 0)}</b> mph</div>`
        }

        new mapboxgl.Popup()
            .setLngLat([cellProperties.coords.longitude, cellProperties.coords.latitude])
            .setHTML(popupHTML)
            .addTo(map);
    }


    //if (theFileStation.toUpperCase() != theFileStation) {
        var theFileStation = stationAbbreviations[l3rad.textHeader.id3];
        var staLat = radarStations[theFileStation][1];
        var staLng = radarStations[theFileStation][2];

        var stormTracks = l3rad.formatted.storms;
        //console.log(stormTracks)
        var stormTracksList = Object.keys(stormTracks);

        var fileTime = getLevel3FileTime(l3rad);

        function loadStormTrack(identifier) {
            // array to store all of the line points
            var lineCoords = [];

            // current storm track
            var curST = stormTracks[identifier].current;
            var curSTCoords = ut.findTerminalCoordinates(staLat, staLng, curST.nm, curST.deg);
            // push the initial coordinate point - we do not know if the current track is a line or a point yet
            var initialPoint = [curSTCoords.longitude, curSTCoords.latitude];
            lineCoords.push(initialPoint)

            // current track's direction (degrees) and speed (knots)
            // curSTMovement.deg, curSTMovement.kts
            var curSTMovement = stormTracks[identifier].movement;

            var curSTProperties = {
                'movement': curSTMovement,
                'cellID': identifier,
                'coords': curSTCoords,
                'time': fileTime.getTime()
            }

            // future storm track (forecast)
            var futureST = stormTracks[identifier].forecast;
            var isLine;
            // if the first forecast value for the current track is null, there is no line track - it is a point
            if (futureST[0] == null) {
                isLine = false;
            } else if (futureST[0] != null) {
                isLine = true;
            }
            if (isLine) {
                for (key in futureST) {
                    // the current index in the futureST variable being looped through
                    var indexedFutureST = futureST[key];
                    // check if the value is null, in which case the storm track is over
                    if (indexedFutureST != null) {
                        var indexedFutureSTCoords = ut.findTerminalCoordinates(staLat, staLng, indexedFutureST.nm, indexedFutureST.deg);
                        var formattedFutureSTCoords = [indexedFutureSTCoords.longitude, indexedFutureSTCoords.latitude];
                        // push the current index point to the line geojson
                        lineCoords.push(formattedFutureSTCoords);
                        // properties for the line circle
                        var forecastSTProperties = {
                            'movement': curSTMovement,
                            'cellID': identifier,
                            'coords': indexedFutureSTCoords,
                            'index': key,
                            'time': fileTime.getTime()
                        }
                        // add a circle for each edge on a storm track line
                        pushNewLinePoint(formattedFutureSTCoords, forecastSTProperties);
                    }
                }

                // add the finished line to the map
                pushNewMultiLineString(lineCoords)
                // adds a blue circle at the start of the storm track
                pushNewMainLinePoint(initialPoint, curSTProperties);
            } else if (!isLine) {
                // if the storm track does not have a forecast, display a Point geojson
                pushNewSinglePoint(initialPoint, curSTProperties);
            }
        }

        // Z0 = line, R1 = point
        for (key in stormTracksList) {
            loadStormTrack(stormTracksList[key])
        }

        // add the storm track lines
        mapFuncs.setGeojsonLayer(multiLineStringGeojson, 'line', 'multiLineString');
        stormTracksLayerArr.push('multiLineString');
        // add the circles on the line edges
        mapFuncs.setGeojsonLayer(linePointGeojson, 'lineCircleEdge', 'linePoint');
        stormTracksLayerArr.push('linePoint');
        // add the red points for isolated cells
        mapFuncs.setGeojsonLayer(singlePointGeojson, 'circle', 'singlePoint');
        stormTracksLayerArr.push('singlePoint');
        // add the blue points for the start of a storm track
        mapFuncs.setGeojsonLayer(mainLinePointGeojson, 'lineCircle', 'mainLinePoint');
        stormTracksLayerArr.push('mainLinePoint');

        $('#dataDiv').data('stormTrackMapLayers', stormTracksLayerArr);

        document.getElementById('allStormTracksLayers').innerHTML = JSON.stringify(stormTracksLayerArr);
        var stLayersText = document.getElementById('allStormTracksLayers').innerHTML;
        var stLayers = stLayersText.replace(/"/g, '').replace(/\[/g, '').replace(/\]/g, '').split(',');
        // setting layer orders
        for (key in stLayers) {
            mapFuncs.moveMapLayer(stLayers[key])
        }


        ut.betterProgressBar('set', 100);
        ut.betterProgressBar('hide');
    //}

    map.on('click', 'mainLinePoint', (e) => { cellClick(e) });
    map.on('click', 'singlePoint', (e) => { cellClick(e) });
    map.on('click', 'linePoint', (e) => { cellClick(e) });

    map.on('mouseenter', 'mainLinePoint', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseenter', 'singlePoint', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseenter', 'linePoint', () => { map.getCanvas().style.cursor = 'pointer'; });

    map.on('mouseleave', 'mainLinePoint', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseleave', 'singlePoint', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseleave', 'linePoint', () => { map.getCanvas().style.cursor = ''; });
}

module.exports = parsePlotStormTracks;