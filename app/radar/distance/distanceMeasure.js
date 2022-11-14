const map = require('../map/map');
const turf = require('@turf/turf');

var mapLayersAdded = [];

function initMapLayers(geojson) {
    map.addLayer({
        'id': 'distanceMeasureLine',
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': geojson,
        },
        'paint': {
            'line-color': '#ffffff',
            'line-width': 1.5,
        }
    })
    mapLayersAdded.push('distanceMeasureLine');

    map.addSource('distanceMeasureCircle', {
        'type': 'geojson',
        'data': geojson,
    })
    map.addLayer({
        'id': 'distanceMeasureCircle',
        'type': 'fill',
        'source': 'distanceMeasureCircle',
        'paint': {
            //#0080ff blue
            //#ff7d7d red
            'fill-color': '#0080ff',
            'fill-opacity': 0.3
        }
    })
    mapLayersAdded.push('distanceMeasureCircle');
    map.addLayer({
        'id': 'distanceMeasureCircleOutline',
        'type': 'line',
        'source': 'distanceMeasureCircle',
        'paint': {
            //#014385 blue
            //#850101 red
            'line-color': '#0080ff',
            'line-width': 4,
            'line-opacity': 0.7
        }
    })
    mapLayersAdded.push('distanceMeasureCircleOutline');

    map.addLayer({
        'id': 'initDistanceMeasurePoint',
        'type': 'circle',
        'source': {
            'type': 'geojson',
            'data': geojson,
        },
        'paint': {
            'circle-radius': 6,
            'circle-stroke-width': 0,
            'circle-color': '#28a0d4',
            'circle-stroke-color': 'white',
        }
    })
    mapLayersAdded.push('initDistanceMeasurePoint');

    map.addLayer({
        'id': 'endDistanceMeasurePoint',
        'type': 'circle',
        'source': {
            'type': 'geojson',
            'data': geojson,
        },
        'paint': {
            'circle-radius': 6,
            'circle-stroke-width': 0,
            'circle-color': '#28a0d4',
            'circle-stroke-color': 'white',
        }
    })
    mapLayersAdded.push('endDistanceMeasurePoint');

    map.addLayer({
        'id': 'distanceMeasureText',
        'type': 'symbol',
        'source': 'endDistanceMeasurePoint',
        'layout': {
            'text-field': ['get', 'distance'],
            'text-font': [
                'Arial Unicode MS Bold'
            ],
            'text-offset': [0, 0.7],
            'text-size': 25,
            //'text-allow-overlap': true,
            'text-ignore-placement': true,
        },
        'paint': {
            'text-color': 'white'
        }
    });
    mapLayersAdded.push('distanceMeasureText');

    map.addLayer({
        'id': 'beamHeightText',
        'type': 'symbol',
        'source': 'initDistanceMeasurePoint',
        'layout': {
            'text-field': ['get', 'distance'],
            'text-font': [
                'Arial Unicode MS Bold'
            ],
            'text-offset': [0, -1.8],
            'text-size': 15,
            //'text-allow-overlap': true,
            'text-ignore-placement': true,
        },
        'paint': {
            'text-color': 'white'
        }
    });
    mapLayersAdded.push('distanceMeasureText');
}

function kmToMiles(km) { return km * 1.609 }

function calculateBeamHeight(distance) {
    var elevation = $('#dataDiv').data('radarElev'); // m
    var height = elevation / 1000; // km
    var range = distance; // km
    var elevAngle = 0.5;
    var earthRadius = 6374; // km

    // https://stackoverflow.com/a/9705160/18758797
    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }

    /*
    * Calculates the beam height MSL (mean sea level (this means above sea level)) in km.
    * Formula taken from https://wx.erau.edu/faculty/mullerb/Wx365/Doppler_formulas/doppler_formulas.pdf
    */
    var beamHeightMSL = Math.sqrt(
        Math.pow(range, 2)
        +
        Math.pow((4/3) * earthRadius + height, 2)
        +
        (2*range)*((4/3) * earthRadius + height)
        *
        Math.sin(toRadians(elevAngle))
    ) - (4/3) * earthRadius;

    var beamHeightKFT = beamHeightMSL * 3.28084;
    var beamHeightMI = kmToMiles(beamHeightMSL);

    return beamHeightMI;
}

var circleUnits = 'miles';
var unitsAbbv = 'mi';
var circleOptions = {steps: 50, units: circleUnits, properties: {}};

var initFadeDuration;

function mouseMove(e) {
    initFadeDuration = map._fadeDuration;
    map._fadeDuration = 0;

    var lnglat = e.lngLat;
    var pointArr = [lnglat.lng, lnglat.lat];
    var initPointCoords = map.getSource('initDistanceMeasurePoint')._data.geometry.coordinates;

    var distance = turf.distance(initPointCoords, pointArr, {units: circleUnits});
    var formattedDistance = `${distance.toFixed(1)} ${unitsAbbv}`;

    if ($('#dataDiv').data('radarElev') != undefined) {
        var beamHeightMI = calculateBeamHeight(turf.distance(initPointCoords, pointArr, {units: 'kilometers'}));
        var formattedBeamHeight = `Beam Height\n${beamHeightMI.toFixed(1)} mi`;
        map.getSource('initDistanceMeasurePoint').setData(turf.point(initPointCoords, {'distance': formattedBeamHeight}));
    }

    var point = turf.point(pointArr, {'distance': formattedDistance});
    var line = turf.lineString([initPointCoords, pointArr]);

    var circle = turf.circle(initPointCoords, distance, circleOptions);

    map.getSource('endDistanceMeasurePoint').setData(point);
    map.getSource('distanceMeasureLine').setData(line);
    map.getSource('distanceMeasureCircle').setData(circle);

    function mouseUp() {
        map.off('mousemove', mouseMove).off('touchmove', mouseMove);
        map._fadeDuration = initFadeDuration;
    }
    map.on('mouseup', mouseUp).on('touchend', mouseUp);
}

function mouseDown(e) {
    var lnglat = e.lngLat;
    var pointArr = [lnglat.lng, lnglat.lat];
    var point = turf.point(pointArr);
    var line = turf.lineString([pointArr, pointArr]);

    var circle = turf.circle(pointArr, 0, circleOptions);

    if (map.getLayer('initDistanceMeasurePoint')) {
        map.getSource('initDistanceMeasurePoint').setData(point);
        map.getSource('endDistanceMeasurePoint').setData(point);
        map.getSource('distanceMeasureLine').setData(line);
        map.getSource('distanceMeasureCircle').setData(circle);
    } else {
        initMapLayers(point);
    }

    e.preventDefault();
    map.on('mousemove', mouseMove).on('touchmove', mouseMove);
}

function initDistanceMeasureListeners() {
    map.on('mousedown', mouseDown).on('touchstart', mouseDown);
}
function disableDistanceMeasure() {
    for (var i in mapLayersAdded) { if (map.getLayer(mapLayersAdded[i])) { map.removeLayer(mapLayersAdded[i]) } }
    for (var i in mapLayersAdded) { if (map.getSource(mapLayersAdded[i])) { map.removeSource(mapLayersAdded[i]) } }
    map.off('mousedown', mouseDown).off('touchstart', mouseDown);
}

//initDistanceMeasureListeners();

module.exports = {
    initDistanceMeasureListeners,
    disableDistanceMeasure
}