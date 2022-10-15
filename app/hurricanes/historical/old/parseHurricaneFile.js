const ut = require('../../radar/utils');
var map = require('../../radar/map/map');

// https://www.nrlmry.navy.mil/atcf_web/docs/database/new/abdeck.txt

var lineStringGeojson = {
    "type": "LineString",
    "coordinates": []
}
function pushNewLineString(coords) {
    lineStringGeojson.coordinates.push(coords);
}

var pointGeojson = {
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
    pointGeojson.features.push(objToPush)
}

function parseHurricaneFile(hurricaneCSV) {
    var theHaMarkerArr = $('#dataDiv').data('haMarkerArr')
    for (var i in theHaMarkerArr) {
        theHaMarkerArr[i].remove()
    }

    var haMarkerArr = [];
    var json = ut.csvToJson(hurricaneCSV);
    console.log(json)

    for (var i in json) {
        try {
            var lat = json[i][6];
            var lon = json[i][7];
            var time = json[i][3]; // e.g. 2021082918 = (august 29, 2021 - 18Z)
            var windSpeed = json[i][9]; // knots
            var windGusts = json[i][20]; // knots
            var pressure = json[i][10]; // millibars
            var stormType = json[i][11];

            // 23.7E = 23.7 lon ||| 23.7W = -23.7 lon
            // 64.2N = 64.2 lat ||| 64.2S = -64.2 lat
            if (lat.includes('S')) { lat = -parseInt(lat) }
            else { lat = parseInt(lat) }
            if (lon.includes('W')) { lon = -parseInt(lon) }
            else { lon = parseInt(lon) }
            lat = lat/10;
            lon = lon/10;

            pushNewPoint([lon, lat], {
                'time': time,
                'windSpeed': windSpeed,
                'windGusts': windGusts,
                'pressure': pressure,
                'stormType': stormType
            });
            var haMarker = new mapboxgl.Marker()
                .setLngLat([lon, lat])
                .addTo(map);
            haMarkerArr.push(haMarker)
            if (parseInt(i) == Object.keys(json).length - 2) {
                $('#dataDiv').data('haMarkerArr', haMarkerArr);
                console.log(pointGeojson)
            }
        } catch (e) {
            console.warn(e);
        }
    }
}

module.exports = parseHurricaneFile;