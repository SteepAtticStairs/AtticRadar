var map = require('./map/map');
const loaders = require('./loaders');

function loadAllStormTrackingStuff() {
    var phpProxy = 'https://php-cors-proxy.herokuapp.com/?';
    function addStormTracksLayers() {
        var fileUrl = `${phpProxy}https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/DS.58sti/SI.${$('#stationInp').val().toLowerCase()}/sn.last`
        //console.log(fileUrl, $('#stationInp').val().toLowerCase())
        loaders.loadFileObject(fileUrl, document.getElementById('radFileName').innerHTML, 3, '58sti');
    }
    function addMesocycloneLayers() {
        var fileUrl = `${phpProxy}https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/DS.141md/SI.${$('#stationInp').val().toLowerCase()}/sn.last`
        //console.log(fileUrl, $('#stationInp').val().toLowerCase())
        loaders.loadFileObject(fileUrl, document.getElementById('radFileName').innerHTML, 3, '141md');
    }
    function addTornadoLayers() {
        var fileUrl = `${phpProxy}https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/DS.61tvs/SI.${$('#stationInp').val().toLowerCase()}/sn.last`
        //console.log(fileUrl, $('#stationInp').val().toLowerCase())
        loaders.loadFileObject(fileUrl, document.getElementById('radFileName').innerHTML, 3, '61tvs');
    }
    function arrayify(text) {
        return text.replace(/"/g, '').replace(/\[/g, '').replace(/\]/g, '').split(',');
    }
    function removeAMapLayer(lay) {
        if (map.getLayer(lay)) {
            map.removeLayer(lay);
        }
        if (map.getSource(lay)) {
            map.removeSource(lay);
        }
    }
    var stLayersText = document.getElementById('allStormTracksLayers').innerHTML;
    var mdLayersText = document.getElementById('allMesocycloneLayers').innerHTML;
    var tvLayersText = document.getElementById('allTornadoLayers').innerHTML;
    var stLayers = arrayify(stLayersText);
    var mdLayers = arrayify(mdLayersText);
    var tvLayers = arrayify(tvLayersText);

    if (document.getElementById('prevStat').innerHTML != document.getElementById('fileStation').innerHTML) {
        var station = document.getElementById('fileStation').innerHTML;
        $.getJSON('https://steepatticstairs.github.io/weather/json/radarStations.json', function (data) {
            var stationLat = data[station][1];
            var stationLng = data[station][2];
            map.flyTo({
                center: [stationLng, stationLat],
                zoom: 8,
                duration: 1000,
            });
        })
        for (key in stLayers) {
            removeAMapLayer(stLayers[key]);
        }
        addStormTracksLayers();
        for (key in mdLayers) {
            removeAMapLayer(mdLayers[key]);
        }
        addMesocycloneLayers();
        for (key in tvLayers) {
            removeAMapLayer(tvLayers[key]);
        }
        addTornadoLayers();
    } else {
        for (key in stLayers) {
            if (map.getLayer(stLayers[key])) {
                map.moveLayer(stLayers[key]);
            }
        }
        for (key in mdLayers) {
            if (map.getLayer(mdLayers[key])) {
                map.moveLayer(mdLayers[key]);
            }
        }
        for (key in tvLayers) {
            if (map.getLayer(tvLayers[key])) {
                map.moveLayer(tvLayers[key]);
            }
        }
    }
    document.getElementById('prevStat').innerHTML = document.getElementById('fileStation').innerHTML;
    document.getElementById('testEventElem').innerHTML = 'changed'
}

module.exports = {
    loadAllStormTrackingStuff
}