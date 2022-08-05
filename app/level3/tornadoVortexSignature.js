const ut = require('../utils');
const mapFuncs = require('../map/mapFunctions');

function parsePlotTornado(l3rad, theFileStation) {
    var tornadoLayersArr = [];
    var geojsonPointTemplate = {
        'type': 'Feature',
        'properties': {},
        'geometry': {
            'type': 'Point',
            'coordinates': 'he'
        }
    }
    $.getJSON('https://steepatticstairs.github.io/weather/json/radarStations.json', function(data) {
        var staLat = data[theFileStation][1];
        var staLng = data[theFileStation][2];

        var tornadoObj = l3rad.formatted.tvs;
        //console.log(tornadoObj)
        var tornadoList = Object.keys(tornadoObj);

        function loadTornado(identifier) {
            // store all map layers being added to be able to manipulate later
            tornadoLayersArr.push(identifier)
            // reset geojson coordinates
            geojsonPointTemplate.geometry.coordinates = [];

            // current storm track
            var curTVS = tornadoObj[identifier];
            var curTVSCoords = ut.findTerminalCoordinates(staLat, staLng, curTVS.az, curTVS.range);
            // push the initial coordinate point - we do not know if the current track is a line or a point yet
            geojsonPointTemplate.geometry.coordinates = [curTVSCoords.longitude, curTVSCoords.latitude];

            mapFuncs.setGeojsonLayer(geojsonPointTemplate, 'yellowCircle', identifier)
        }
        for (key in tornadoList) {
            loadTornado(tornadoList[key])
        }
        document.getElementById('allTornadoLayers').innerHTML = JSON.stringify(tornadoLayersArr);
    });
}

module.exports = parsePlotTornado;