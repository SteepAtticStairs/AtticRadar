const ut = require('../../utils');
const mapFuncs = require('../../map/mapFunctions');
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
        'type': 'MultiPoint',
        'coordinates': []
    }
    function pushNewLinePoint(coords) {
        linePointGeojson.coordinates.push(coords);
    }

    // for the red points for isolated cells
    var singlePointGeojson = {
        'type': 'MultiPoint',
        'coordinates': []
    }
    function pushNewSinglePoint(coords) {
        singlePointGeojson.coordinates.push(coords);
    }

    // for the blue points for the start of a storm track
    var mainLinePointGeojson = {
        "type": "FeatureCollection",
        "features": []
    }
    function pushNewMainLinePoint(coords, properties) {
        // this just allows you to add properties for each cell
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

    $.getJSON('https://steepatticstairs.github.io/NexradJS/resources/radarStations.json', function (data) {
        var staLat = data[theFileStation][1];
        var staLng = data[theFileStation][2];

        var stormTracks = l3rad.formatted.storms;
        //console.log(stormTracks)
        var stormTracksList = Object.keys(stormTracks);

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
                        // add a circle for each edge on a storm track line
                        pushNewLinePoint(formattedFutureSTCoords);
                    }
                }

                var curSTProperties = {
                    'movement': curSTMovement,
                    'cellID': identifier,
                    'coords': curSTCoords
                }

                // add the finished line to the map
                pushNewMultiLineString(lineCoords)
                // adds a blue circle at the start of the storm track
                pushNewMainLinePoint(initialPoint, curSTProperties);
            } else if (!isLine) {
                // if the storm track does not have a forecast, display a Point geojson
                pushNewSinglePoint(initialPoint);
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

        document.getElementById('allStormTracksLayers').innerHTML = JSON.stringify(stormTracksLayerArr);
        var stLayersText = document.getElementById('allStormTracksLayers').innerHTML;
        var stLayers = stLayersText.replace(/"/g, '').replace(/\[/g, '').replace(/\]/g, '').split(',');
        // setting layer orders
        for (key in stLayers) {
            mapFuncs.moveMapLayer(stLayers[key])
        }
    });

    map.on('click', 'mainLinePoint', (e) => {
        var cellProperties = e.features[0].properties;
        cellProperties.movement = JSON.parse(cellProperties.movement);
        cellProperties.coords = JSON.parse(cellProperties.coords);

        var popupHTML = 
        `<div>Cell <b>${cellProperties.cellID}</b></div>
        <div><b>${ut.degToCompass(cellProperties.movement.deg - 180)}</b> at <b>${ut.knotsToMph(cellProperties.movement.kts, 0)}</b> mph</div>`

        new mapboxgl.Popup()
            .setLngLat([cellProperties.coords.longitude, cellProperties.coords.latitude])
            .setHTML(popupHTML)
            .addTo(map);
    });
    map.on('mouseenter', 'mainLinePoint', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'mainLinePoint', () => {
        map.getCanvas().style.cursor = '';
    });
}

module.exports = parsePlotStormTracks;