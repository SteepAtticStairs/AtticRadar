const createOffCanvasItem = require('../../radar/menu/createOffCanvasItem');
const initHurricaneArchiveListeners = require('./eventListeners');
const parseHurricaneFile = require('./plotIBTRACS');
const ut = require('../../radar/utils');
var map = require('../../radar/map/map');

function startRightAway() {
    // hurricane michael
    var id = '2018280N18273';
    $.getJSON(`https://raw.githubusercontent.com/SteepAtticStairs/hurricaneArchives/main/IBTrACS/storms/${id}.json`, function(data) {
        parseHurricaneFile(data, id);
        ut.haMapControlActions('show');
    })
}

createOffCanvasItem({
    'id': 'historicalHurricanesMenuItem',
    'class': 'alert alert-secondary offCanvasMenuItem',
    'contents': 'Hurricane Archive',
    'icon': 'fa fa-hurricane',
    'css': ''
}, function(thisObj, innerDiv, iconElem) {
    $('#hurricaneArchiveModalTrigger').click();
    ut.haMapControlActions('show');
})

initHurricaneArchiveListeners();

$('#haClearMap').on('click', function() {
    ut.haMapControlActions('hide');

    var haMapLayers = $('#dataDiv').data('haMapLayers');
    for (var i in haMapLayers) {
        //map.setLayoutProperty(haMapLayers[i], 'visibility', 'none');
        if (map.getLayer(haMapLayers[i])) {
            map.removeLayer(haMapLayers[i]);
        }
    }
    for (var i in haMapLayers) {
        if (map.getSource(haMapLayers[i])) {
            map.removeSource(haMapLayers[i]);
        }
    }
})

function shouldStartRightAway() {
    if (!map.loaded()) {
        map.on('load', function() {
            startRightAway();
        })
    } else {
        startRightAway();
    }
}
shouldStartRightAway();