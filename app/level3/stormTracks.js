const ut = require('../utils');
const mapFuncs = require('../map/mapFunctions');

function parsePlotStormTracks(l3rad, theFileStation) {
    var stormTracksLayerArr = [];
    // load storm tracking information
    var geojsonLineTemplate = {
        'type': 'Feature',
        'properties': {},
        'geometry': {
            'type': 'LineString',
            'coordinates': []
        }
    }
    var geojsonPointTemplate = {
        'type': 'Feature',
        'properties': {},
        'geometry': {
            'type': 'Point',
            'coordinates': []
        }
    }

    $.getJSON('https://steepatticstairs.github.io/weather/json/radarStations.json', function(data) {
        var staLat = data[theFileStation][1];
        var staLng = data[theFileStation][2];

        var stormTracks = l3rad.formatted.storms;
        //console.log(stormTracks)
        var stormTracksList = Object.keys(stormTracks);

        function loadStormTrack(identifier) {
            // store all map layers being added to be able to manipulate later
            stormTracksLayerArr.push(identifier)
            // reset geojson coordinates
            geojsonLineTemplate.geometry.coordinates = [];
            geojsonLineTemplate.geometry.type = 'LineString';

            // current storm track
            var curST = stormTracks[identifier].current;
            var curSTCoords = ut.findTerminalCoordinates(staLat, staLng, curST.nm, curST.deg);
            // push the initial coordinate point - we do not know if the current track is a line or a point yet
            geojsonLineTemplate.geometry.coordinates.push([curSTCoords.longitude, curSTCoords.latitude])

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
                        // push the current index point to the line geojson object
                        geojsonLineTemplate.geometry.coordinates.push([indexedFutureSTCoords.longitude, indexedFutureSTCoords.latitude]);
                        // add a circle for each edge on a storm track line
                        geojsonPointTemplate.geometry.coordinates = [indexedFutureSTCoords.longitude, indexedFutureSTCoords.latitude]
                        mapFuncs.setGeojsonLayer(geojsonLineTemplate, 'lineCircleEdge', identifier + '_pointEdge' + key)
                        stormTracksLayerArr.push(identifier + '_pointEdge' + key)
                    }
                }
                // push the finished geojson line object to a function that adds to the map
                mapFuncs.setGeojsonLayer(geojsonLineTemplate, 'line', identifier)
                // adds a blue circle at the start of the storm track
                geojsonLineTemplate.geometry.coordinates = geojsonLineTemplate.geometry.coordinates[0]
                geojsonLineTemplate.geometry.type = 'Point';
                mapFuncs.setGeojsonLayer(geojsonLineTemplate, 'lineCircle', identifier + '_point')
                stormTracksLayerArr.push(identifier + '_point')
            } else if (!isLine) {
                // if the storm track does not have a forecast, display a Point geojson
                geojsonLineTemplate.geometry.coordinates = geojsonLineTemplate.geometry.coordinates[0]
                geojsonLineTemplate.geometry.type = 'Point';
                mapFuncs.setGeojsonLayer(geojsonLineTemplate, 'circle', identifier)
            }
        }
        // Z0 = line, R1 = point
        for (key in stormTracksList) {
            loadStormTrack(stormTracksList[key])
        }
        document.getElementById('allStormTracksLayers').innerHTML = JSON.stringify(stormTracksLayerArr);
        var stLayersText = document.getElementById('allStormTracksLayers').innerHTML;
        var stLayers = stLayersText.replace(/"/g, '').replace(/\[/g, '').replace(/\]/g, '').split(',');
        // setting layer orders
        for (key in stLayers) {
            if (stLayers[key].includes('_pointEdge')) {
                mapFuncs.moveMapLayer(stLayers[key])
            }
        }
        for (key in stLayers) {
            if (stLayers[key].includes('_point')) {
                mapFuncs.moveMapLayer(stLayers[key])
            }
        }
    });
}

module.exports = parsePlotStormTracks;