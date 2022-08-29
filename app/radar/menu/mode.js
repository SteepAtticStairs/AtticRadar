const createMenuOption = require('./createMenuOption');

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

createMenuOption({
    'id': 'modeMenuItem',
    'class': 'alert alert-success offCanvasMenuItem',
    'contents': 'Current File Mode',
    'css': ''
}, function(thisObj) {
    if ($(thisObj).hasClass('alert-success')) {
        $(thisObj).removeClass('alert-success');
        $(thisObj).addClass('alert-danger');
        thisObj.innerHTML = 'Upload File Mode';

        showHideFileBox('show');
    } else if ($(thisObj).hasClass('alert-danger')) {
        $(thisObj).removeClass('alert-danger');
        $(thisObj).addClass('alert-success');
        thisObj.innerHTML = 'Current File Mode';

        showHideFileBox('hide');
    }
})