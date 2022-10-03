var map = require('../map/map');
const GeoJsonGeometriesLookup = require('geojson-geometries-lookup');

function setTextField(geojson) {
    // var blob = new Blob([JSON.stringify(geojson)], {type: "text/plain"});
    // var url = window.URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.style.display = 'none';
    // a.href = url;
    // // the filename you want
    // a.download = 'suss.geojson';
    // document.body.appendChild(a);
    // a.click();
    const glookup = new GeoJsonGeometriesLookup(geojson);
    map.on('move', function(e) {
        if ($('.colorPicker').is(":visible")) {
            try {
                var mapCenter = map.getCenter();
                const point1 = {type: "Point", coordinates: [mapCenter.lng, mapCenter.lat]};
                var val = glookup.getContainers(point1).features[0].properties.value;
                //val = val - 30;
                $('#colorPickerText').text(val);
                //console.log(map.getZoom())
            } catch (e) {
                $('#colorPickerText').text('');
            }
        }
    })
}

module.exports = setTextField;