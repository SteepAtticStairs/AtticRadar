var map = require('../../../map/map');
const loaders = require('../../../loaders');
const ut = require('../../../utils');
const phpProxy = ut.phpProxy;

function loadAllStormTrackingStuff() {
    function addStormTracksLayers() {
        // loaders.getLatestL3File($('#stationInp').val().slice(1), 'NST', function (fileName) {
        //     loaders.loadFileObject(phpProxy + fileName, document.getElementById('radFileName').innerHTML, 3, 'NST');
        // });
        var fileUrl = `${phpProxy}https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/DS.58sti/SI.${$('#stationInp').val().toLowerCase()}/sn.last`
        //console.log(fileUrl, $('#stationInp').val().toLowerCase())
        loaders.getLatestFile($('#stationInp').val(), [3, 'NST', 0], function(url) {
            console.log(url);
            loaders.loadFileObject(fileUrl + '#', 3);
        })
        //loaders.loadFileObject(fileUrl, 3);
    }
    function addMesocycloneLayers() {
        var fileUrl = `${phpProxy}https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/DS.141md/SI.${$('#stationInp').val().toLowerCase()}/sn.last`
        //console.log(fileUrl, $('#stationInp').val().toLowerCase())
        loaders.loadFileObject(fileUrl + '#', 3);
    }
    function addTornadoLayers() {
        var fileUrl = `${phpProxy}https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/DS.61tvs/SI.${$('#stationInp').val().toLowerCase()}/sn.last`
        //console.log(fileUrl, $('#stationInp').val().toLowerCase())
        loaders.loadFileObject(fileUrl + '#', 3);
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
    // var mdLayersText = document.getElementById('allMesocycloneLayers').innerHTML;
    // var tvLayersText = document.getElementById('allTornadoLayers').innerHTML;
    var stLayers = arrayify(stLayersText);
    // var mdLayers = arrayify(mdLayersText);
    // var tvLayers = arrayify(tvLayersText);

    if (document.getElementById('prevStat').innerHTML != document.getElementById('fileStation').innerHTML) {
        ut.flyToStation();
        for (key in stLayers) {
            removeAMapLayer(stLayers[key]);
        }
        addStormTracksLayers();
        // for (key in mdLayers) {
        //     removeAMapLayer(mdLayers[key]);
        // }
        // addMesocycloneLayers();
        // for (key in tvLayers) {
        //     removeAMapLayer(tvLayers[key]);
        // }
        // addTornadoLayers();
    } else {
        for (key in stLayers) {
            if (map.getLayer(stLayers[key])) {
                map.moveLayer(stLayers[key]);
            }
        }
        // for (key in mdLayers) {
        //     if (map.getLayer(mdLayers[key])) {
        //         map.moveLayer(mdLayers[key]);
        //     }
        // }
        // for (key in tvLayers) {
        //     if (map.getLayer(tvLayers[key])) {
        //         map.moveLayer(tvLayers[key]);
        //     }
        // }
    }
    document.getElementById('prevStat').innerHTML = document.getElementById('fileStation').innerHTML;
    document.getElementById('testEventElem').innerHTML = 'changed'

    ut.progressBarVal('hide');
}

module.exports = {
    loadAllStormTrackingStuff
}