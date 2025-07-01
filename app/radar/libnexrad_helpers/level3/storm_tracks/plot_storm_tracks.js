// const radarStations = require('../../../../../resources/radarStations');
const nexrad_locations = require('../../../libnexrad/nexrad_locations').NEXRAD_LOCATIONS;
const turf = require('@turf/turf');
const map = require('../../../../core/map/map');
const setLayerOrder = require('../../../../core/map/setLayerOrder');
const ut = require('../../../../core/utils');
const AtticPopup = require('../../../../core/popup/AtticPopup');

function findTerminalCoordinates(startLat, startLng, distanceNM, bearingDEG) {
    var metersInNauticalMiles = 1852;
    var distanceMeters = distanceNM * metersInNauticalMiles;
    var bearing = bearingDEG;

    var point = turf.point([startLng, startLat]);
    var destiation = turf.destination(point, distanceMeters, bearing, {units: 'meters'});
    return destiation;
}

function getCoords(degNmObj, station) {
    const currentStationCoords = { 'lat': nexrad_locations[station].lat, 'lng': nexrad_locations[station].lon }

    var coords = findTerminalCoordinates(currentStationCoords.lat, currentStationCoords.lng, degNmObj.nm, degNmObj.deg);
    return turf.getCoords(coords);
}

// const max_lut_value = 100;
// const stormtrack_length_lookup_obj = {};
// for (var i = 1; i <= max_lut_value; i++) {
//     stormtrack_length_lookup_obj[i] = (0.2 * ((max_lut_value + 1) - i)) / 4;
// }
function _calculate_parallel_line(speed, interval) {
    const calc = (0.15 * ((100 - speed) * interval)) / 2.2; // (1.25 - interval)
    return calc;
}

function generateParallelLine(basePoint, destPoint, cellData, forecastIndex) {
    function addToBearing(bearing, angle) { return (bearing + angle) % 360 }
    function subtractFromBearing(bearing, angle) { return (bearing - angle + 360) % 360 }

    // basePoint = turf.point(turf.getCoords(basePoint));
    // destPoint = turf.point(turf.getCoords(destPoint));

    var bearing = turf.bearing(basePoint, destPoint);

    // 15min, 30min, 45min, 1hr
    var timeIntervalLookup = [0.25, 0.5, 0.75, 1];
    // ((speed * time interval) * convert kts to mph) / scaling
    // const distanceForLine = (cellData.movement.kts * timeIntervalLookup[forecastIndex] * 0.868976242) / 12; // miles
    const distanceForLine = 1; // miles
    // const distanceForLine = _calculate_parallel_line(cellData.movement.kts, timeIntervalLookup[forecastIndex]);

    var leftBearing = subtractFromBearing(bearing, 90);
    var leftPoint = turf.destination(destPoint, distanceForLine, leftBearing, {units: 'miles'});
    var rightBearing = addToBearing(bearing, 90);
    var rightPoint = turf.destination(destPoint, distanceForLine, rightBearing, {units: 'miles'});

    return turf.lineString([turf.getCoords(leftPoint), turf.getCoords(rightPoint)]);
}

function plot_storm_tracks(L3Factory) {
    const allTracks = L3Factory.formatted_tabular.storms;

    function individualCell(id) {
        var points = [];
        var parallelLines = [];
        var coords;
        var initialPoint;
        var curCell = allTracks[id];

        coords = getCoords(curCell.current, L3Factory.station);
        points.push(coords);
        const originalInitialPoint = turf.point(coords, {cellID: id, coords: coords, cellProperties: curCell});
        initialPoint = turf.point(coords, {cellID: id, coords: coords, cellProperties: curCell});
        for (var i in curCell.forecast) {
            var curPoint = curCell.forecast[i];
            if (curPoint != null) {
                coords = getCoords(curPoint, L3Factory.station);
                parallelLines.push(generateParallelLine(initialPoint, coords, curCell, i));
                points.push(coords);
                initialPoint = turf.point(coords, {cellID: id, coords: coords, cellProperties: curCell});
            }
        }

        return [points, originalInitialPoint, parallelLines];
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
    var multiPointGeoJSON = turf.featureCollection(multiPointCoords);
    var featureCollectionGeoJSON = turf.featureCollection(featureCollectionObjects.flat());

    var storm_track_layers = [];
    // to add black borders to the lines
    for (var i = 0; i <= 1; i++) {
        storm_track_layers.push('stormTrackParallelLines' + i);
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
        storm_track_layers.push('stormTrackLines' + i);
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
    storm_track_layers.push('stormTrackInitialPoint');
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
    window.atticData.storm_track_layers = storm_track_layers;

    function cellClick(e) {
        const renderedFeatures = map.queryRenderedFeatures(e.point);
        if (renderedFeatures[0] && renderedFeatures[0].layer.id == 'stationSymbolLayer') return;

        // if (window.atticData.currentStation == L3Factory.station) {
            const properties = e.features[0].properties;
            const cellID = properties.cellID;
            const cellProperties = JSON.parse(properties.cellProperties);
            // console.log(allTracks)

            var fileTime = L3Factory.get_date();
            var hourMin = ut.printHourMin(fileTime, ut.userTimeZone);

            var popupHTML =
`<b><u>Storm Track</u></b>
<div>Cell <b>${cellID}</b> at <b>${hourMin}</b></div>`

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

            if (cellProperties.graph_data != undefined) {
                popupHTML +=
`<br>
<div>Max Reflectivity: <b>${cellProperties?.graph_data?.dbzm} dBZ</b>
<div>Height of Max Refl: <b>${cellProperties?.graph_data?.hgt} kft</b>`
            }

            // new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000' })
            //     .setLngLat(JSON.parse(properties.coords))
            //     .setHTML(popupHTML)
            //     .addTo(map);
            new AtticPopup(JSON.parse(properties.coords), popupHTML).add_to_map();
        // }
    }
    map.on('click', 'stormTrackInitialPoint', cellClick);
    map.on('mouseenter', 'stormTrackInitialPoint', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'stormTrackInitialPoint', () => { map.getCanvas().style.cursor = ''; });

    setLayerOrder();

    var isSTVisChecked = $('#armrSTVisBtnSwitchElem').is(':checked');
    if (!isSTVisChecked) {
        if (storm_track_layers != undefined) {
            for (var i in storm_track_layers) {
                map.setLayoutProperty(storm_track_layers[i], 'visibility', 'none');
            }
        }
    }
}

module.exports = plot_storm_tracks;