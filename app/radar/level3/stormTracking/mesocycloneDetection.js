const ut = require('../../utils');
const mapFuncs = require('../../map/mapFunctions');

function parsePlotMesocyclone(l3rad, theFileStation) {
    var mesocycloneLayersArr = [];
    var geojsonPointTemplate = {
        'type': 'Feature',
        'properties': {},
        'geometry': {
            'type': 'Point',
            'coordinates': 'he'
        }
    }
    $.getJSON('resources/radarStations.json', function(data) {
        var staLat = data[theFileStation][1];
        var staLng = data[theFileStation][2];

        var mesocycloneObj = l3rad.formatted.mesocyclone;
        if (mesocycloneObj != undefined) {
            var mesocycloneList = Object.keys(mesocycloneObj);

            function loadMesocyclone(identifier) {
                // store all map layers being added to be able to manipulate later
                mesocycloneLayersArr.push(identifier)
                // reset geojson coordinates
                geojsonPointTemplate.geometry.coordinates = [];

                // current storm track
                var curMC = mesocycloneObj[identifier];
                var curMCCoords = ut.findTerminalCoordinates(staLat, staLng, curMC.az, curMC.ran);
                // push the initial coordinate point - we do not know if the current track is a line or a point yet
                geojsonPointTemplate.geometry.coordinates = [curMCCoords.longitude, curMCCoords.latitude];

                mapFuncs.setGeojsonLayer(geojsonPointTemplate, 'greenCircle', identifier)
            }
            for (key in mesocycloneList) {
                loadMesocyclone(mesocycloneList[key])
            }
            document.getElementById('allMesocycloneLayers').innerHTML = JSON.stringify(mesocycloneLayersArr);
        }
    })
}

module.exports = parsePlotMesocyclone;