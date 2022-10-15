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

function parseHurricaneFile(hurricaneJSON) {
    var theHaMarkerArr = $('#dataDiv').data('haMarkerArr')
    for (var i in theHaMarkerArr) {
        theHaMarkerArr[i].remove()
    }

    var haMarkerArr = [];
    var json = hurricaneJSON;
    console.log(json)

    for (var i in json) {
        try {
            var lat = json[i].LAT;
            var lon = json[i].LON;

            pushNewPoint([lon, lat], json[i]);
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