const createOffCanvasItem = require('../../radar/menu/createOffCanvasItem');
const fetchHurricaneFile = require('./fetchHurricaneFile');

function zeroPad(num, length) {
    length = length || 2; // defaults to 2 if no parameter is passed
    return (new Array(length).join('0') + num).slice(length*-1);
}

function startRightAway() {
    var _year = '2018';
    $('#haDatePicker').val(_year)
    var _stormID = getStormID('Michael', _year).id;
    $('#haStormName').val('Michael')

    fetchHurricaneFile(_stormID, _year)
}

function getStormID(name, year) {
    name = name.toUpperCase();
    var stormYear = allStorms[year];
    for (var i in stormYear) {
        if (stormYear[i][0] == name) {
            return {
                'basin': stormYear[i][1],
                'id': stormYear[i][2].toLowerCase(),
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

    $('#haSubmitBtn').on('click', function() {
        $('#hurricaneArchiveModalTrigger').click();

        var year = $('#haDatePicker').val();
        var stormID = getStormID($('#haStormName').val(), year).id;

        fetchHurricaneFile(stormID, year)
    })
})

startRightAway();