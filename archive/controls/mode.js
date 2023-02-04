const loaders = require('../../loaders');
const ut = require('../../utils');
const createControl = require('./createControl');
var map = require('../map');

function showHideFileBox(showHide) {
    $('.stationBtn').click();
    if (showHide == 'show') {
        // file mode
        $('#dataDiv').data('isFileUpload', true);

        $('#fileUploadSpan').show();
        $('#uploadModeSpan').show();
        $('#radarInfoSpan').hide();
        $('#currentModeSpan').hide();
    } else if (showHide == 'hide') {
        // current data mode
        $('#dataDiv').data('isFileUpload', false);

        $('#fileUploadSpan').hide();
        $('#uploadModeSpan').hide();
        $('#radarInfoSpan').show();
        $('#currentModeSpan').show();
    }
}

createControl({
    'id': 'modeThing',
    'class': 'modeBtn',
    'position': 'top-left',
    'icon': 'fa-clock',
    'css': 'margin-top: 100%;'
}, function() {
    if (!$('#dataDiv').data('noMoreClicks')) {
        if ($('#modeThing').hasClass('fa-clock')) {
            $('#modeThing').removeClass('fa-clock');
            $('#modeThing').removeClass('icon-green');

            $('#modeThing').addClass('fa-upload');
            $('#modeThing').addClass('icon-red');

            showHideFileBox('show')
        } else if (!$('#modeThing').hasClass('fa-clock')) {
            $('#modeThing').removeClass('fa-upload');
            $('#modeThing').removeClass('icon-red');

            $('#modeThing').addClass('fa-clock');
            $('#modeThing').addClass('icon-green');

            showHideFileBox('hide')
        }
    }
})
$('#modeThing').removeClass('icon-black');
$('#modeThing').addClass('icon-green');