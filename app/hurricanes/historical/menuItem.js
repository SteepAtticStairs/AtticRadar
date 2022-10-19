const createOffCanvasItem = require('../../radar/menu/createOffCanvasItem');
const initHurricaneArchiveListeners = require('./eventListeners');
const parseHurricaneFile = require('./plotIBTRACS');
const ut = require('../../radar/utils');
var map = require('../../radar/map/map');

function zeroPad(num, length) {
    length = length || 2; // defaults to 2 if no parameter is passed
    return (new Array(length).join('0') + num).slice(length*-1);
}

// function findStorm(json, name, year, basin, sid) {
//     var keys = Object.keys(json);
//     for (var i in keys) {
//         if (keys[i] == `${sid}-${name}-${year}-${basin}`) {
//             return json[keys[i]];
//         }
//     }
// }
function findStorm(json, sid) {
    var keys = Object.keys(json);
    for (var i in keys) {
        if (keys[i].includes(sid)) {
            return json[keys[i]];
        }
    }
}

function startRightAway() {
    // var stormJSON = ibtracsArchive['TIP_1979'];
    // parseHurricaneFile(stormJSON)
    // ./IBTrACS/ibtracsArchive.json
    $.getJSON('../app/hurricanes/historical/IBTrACS/ibtracsArchive.json', function(data) {
        console.log(findStorm(data, '2021239N17281'))
    })
    // var _year = '2018';
    // var _stormID = getStormID('Michael', _year).id;
    // $('#haSearchStorm').val('Michael')

    // fetchHurricaneFile(_stormID, _year)
}

function getStormID(name, year) {
    name = name.toUpperCase();
    var stormYear = allStorms[year];
    for (var i in stormYear) {
        if (stormYear[i][0] == name) {
            return {
                'basin': stormYear[i][3],
                'id': stormYear[i][1].toLowerCase(),
            };
        }
    }
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

//startRightAway();