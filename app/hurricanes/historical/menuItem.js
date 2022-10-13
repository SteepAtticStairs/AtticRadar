const createOffCanvasItem = require('../../radar/menu/createOffCanvasItem');
const fetchHurricaneFile = require('./fetchHurricaneFile');
const initHurricaneArchiveListeners = require('./eventListeners');

function zeroPad(num, length) {
    length = length || 2; // defaults to 2 if no parameter is passed
    return (new Array(length).join('0') + num).slice(length*-1);
}

function startRightAway() {
    var _year = '2018';
    var _stormID = getStormID('Michael', _year).id;
    $('#haSearchStorm').val('Michael')

    fetchHurricaneFile(_stormID, _year)
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
})

initHurricaneArchiveListeners();

//startRightAway();