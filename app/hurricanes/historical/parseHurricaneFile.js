const ut = require('../../radar/utils');
var map = require('../../radar/map/map');

function parseHurricaneFile(hurricaneCSV) {
    var theHaMarkerArr = $('#dataDiv').data('haMarkerArr')
    for (var i in theHaMarkerArr) {
        theHaMarkerArr[i].remove()
    }

    var haMarkerArr = [];
    var json = ut.csvToJson(hurricaneCSV);
    console.log(json)

    var lat;
    var lon;
    for (var i in json) {
        try {
            lat = json[i][6];
            lon = json[i][7];

            // 23.7E = 23.7 lon ||| 23.7W = -23.7 lon
            // 64.2N = 64.2 lat ||| 64.2S = -64.2 lat
            if (lat.includes('S')) { lat = -parseInt(lat) }
            else { lat = parseInt(lat) }
            if (lon.includes('W')) { lon = -parseInt(lon) }
            else { lon = parseInt(lon) }
            lat = lat/10;
            lon = lon/10;

            var haMarker = new mapboxgl.Marker()
                .setLngLat([lon, lat])
                .addTo(map);
            haMarkerArr.push(haMarker)
            if (parseInt(i) == Object.keys(json).length - 2) {
                $('#dataDiv').data('haMarkerArr', haMarkerArr);
            }
        } catch (e) {
            console.warn(e);
        }
    }
}

module.exports = parseHurricaneFile;