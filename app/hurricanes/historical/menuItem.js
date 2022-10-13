const createOffCanvasItem = require('../../radar/menu/createOffCanvasItem');
const fetchHurricaneFile = require('./fetchHurricaneFile');

function zeroPad(num, length) {
    length = length || 2; // defaults to 2 if no parameter is passed
    return (new Array(length).join('0') + num).slice(length*-1);
}

function startRightAway() {
    var _year = '2018';
    var _stormNumber = '14';
    var _basin = 'al';
    $('#haDatePicker').val(_year);
    $('#haStormNumber').val(_stormNumber);
    $('#haBasin').val(_basin);

    fetchHurricaneFile(zeroPad(_stormNumber), _year, _basin)
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
        var stormNumber = $('#haStormNumber').val();
        var basin = $('#haBasinDropdown').val();

        fetchHurricaneFile(zeroPad(stormNumber), year, basin)
    })
})

//startRightAway();