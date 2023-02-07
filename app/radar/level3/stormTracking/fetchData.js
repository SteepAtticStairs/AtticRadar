const ut = require('../../utils');
const loaders = require('../../loaders');
const l3parse = require('../../../../lib/nexrad-level-3-data/src');
const plotStormTracks = require('./stormTracks');
var map = require('../../map/map');

function dealWithStormTrackLayers() {
    var stormTrackLayers = window.atticData.stormTrackLayers;
    if (stormTrackLayers != undefined) {
        for (var i in stormTrackLayers) {
            if (map.getLayer(stormTrackLayers[i])) { map.removeLayer(stormTrackLayers[i]) }
            if (map.getSource(stormTrackLayers[i])) { map.removeSource(stormTrackLayers[i]) }
        }
    }
}

function initStormTracks() {
    const currentStation = window.atticData.currentStation;

    dealWithStormTrackLayers();

    loaders.getLatestFile(currentStation, [3, 'NST', 0], function(url) {
        loaders.returnArrayBuffer(ut.phpProxy + url + '#', 3, function(ab) {
            ut.betterProgressBar('hide');

            var l3rad = l3parse(ab);
            plotStormTracks(l3rad);
        });
    })
}

module.exports = {
    initStormTracks
}