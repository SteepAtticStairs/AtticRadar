const radarStations = require('../../../../resources/radarStations');
const turf = require('@turf/turf');
var map = require('../../map/map');
const setLayerOrder = require('../../map/setLayerOrder');

function findTerminalCoordinates(startLat, startLng, distanceNM, bearingDEG) {
    var metersInNauticalMiles = 1852;
    var distanceMeters = distanceNM * metersInNauticalMiles;
    var bearing = bearingDEG;

    var point = turf.point([startLng, startLat]);
    var destiation = turf.destination(point, distanceMeters, bearing, {units: 'meters'});
    return destiation;
}

function getCoords(degNmObj) {
    const currentStation = window.atticData.currentStation;
    const currentStationCoords = { 'lat': radarStations[currentStation][1], 'lng': radarStations[currentStation][2] }

    var coords = findTerminalCoordinates(currentStationCoords.lat, currentStationCoords.lng, degNmObj.nm, degNmObj.deg);
    return coords.geometry.coordinates;
}

function generateParallelLine(basePoint, destPoint, cellData, forecastIndex) {
    function addToBearing(bearing, angle) { return (bearing + angle) % 360 }
    function subtractFromBearing(bearing, angle) { return (bearing - angle + 360) % 360 }

    basePoint = turf.point(basePoint);
    destPoint = turf.point(destPoint);

    var bearing = turf.bearing(basePoint, destPoint);

    // 15min, 30min, 45min, 1hr
    var timeIntervalLookup = [0.25, 0.5, 0.75, 1];
    // ((speed * time interval) * convert kts to mph) / scaling
    const distanceForLine = (cellData.movement.kts * timeIntervalLookup[forecastIndex] * 0.868976242) / 12; // miles

    var leftBearing = subtractFromBearing(bearing, 90);
    var leftPoint = turf.destination(destPoint, distanceForLine, leftBearing, {units: 'miles'});
    var rightBearing = addToBearing(bearing, 90);
    var rightPoint = turf.destination(destPoint, distanceForLine, rightBearing, {units: 'miles'});

    return turf.lineString([leftPoint.geometry.coordinates, rightPoint.geometry.coordinates]);
}

function plotStormTracks(l3rad) {
    const allTracks = l3rad.formatted.storms;

    function individualCell(id) {
        var points = [];
        var parallelLines = [];
        var coords;
        var initialPoint;
        var curCell = allTracks[id];

        coords = getCoords(curCell.current);
        points.push(coords);
        initialPoint = [...coords];
        for (var i in curCell.forecast) {
            var curPoint = curCell.forecast[i];
            if (curPoint != null) {
                coords = getCoords(curPoint);
                parallelLines.push(generateParallelLine(initialPoint, coords, curCell, i));
                points.push(coords);
            }
        }

        return [points, initialPoint, parallelLines];
    }

    var stormIDs = Object.keys(allTracks);
    var multiLineStringCoords = [];
    var multiPointCoords = [];
    var featureCollectionObjects = [];
    for (var i in stormIDs) {
        var icResult = individualCell(stormIDs[i]); // L5
        multiLineStringCoords.push(icResult[0]);
        multiPointCoords.push(icResult[1]);
        featureCollectionObjects.push(icResult[2]);
    }
    var multiLineGeoJSON = turf.multiLineString(multiLineStringCoords);
    var multiPointGeoJSON = turf.multiPoint(multiPointCoords);
    var featureCollectionGeoJSON = turf.featureCollection(featureCollectionObjects.flat());

    var stormTrackLayers = [];
    // to add black borders to the lines
    for (var i = 0; i <= 1; i++) {
        stormTrackLayers.push('stormTrackParallelLines' + i);
        map.addLayer({
            id: 'stormTrackParallelLines' + i,
            type: 'line',
            source: {
                'type': 'geojson',
                'data': featureCollectionGeoJSON,
            },
            layout: {
                'line-cap': 'square'
            },
            paint: {
                'line-color': i == 1 ? 'white' : 'black',
                'line-width': i == 1 ? 2 : 4,
            }
        })
        stormTrackLayers.push('stormTrackLines' + i);
        map.addLayer({
            id: 'stormTrackLines' + i,
            type: 'line',
            source: {
                'type': 'geojson',
                'data': multiLineGeoJSON,
            },
            layout: {
                'line-cap': 'square'
            },
            paint: {
                'line-color': i == 1 ? 'white' : 'black',
                'line-width': i == 1 ? 2 : 4,
            }
        })
    }
    stormTrackLayers.push('stormTrackInitialPoint');
    map.addLayer({
        id: 'stormTrackInitialPoint',
        type: 'circle',
        source: {
            'type': 'geojson',
            'data': multiPointGeoJSON,
        },
        paint: {
            'circle-radius': 3,
            'circle-stroke-width': 1,
            'circle-color': 'white',
            'circle-stroke-color': 'black',
        }
    })
    window.atticData.stormTrackLayers = stormTrackLayers;

    setLayerOrder();

    var isSTVisChecked = $('#armrSTVisBtnSwitchElem').is(':checked');
    if (!isSTVisChecked) {
        if (stormTrackLayers != undefined) {
            for (var i in stormTrackLayers) {
                map.setLayoutProperty(stormTrackLayers[i], 'visibility', 'none');
            }
        }
    }
}

module.exports = plotStormTracks;