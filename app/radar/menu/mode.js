const createMenuOption = require('./createMenuOption');
const createOffCanvasItem = require('./createOffCanvasItem');

function showHideFileBox(showHide) {
    $('#stationMenuItemIcon').click();
    if (showHide == 'show') {
        // file mode
        $('#dataDiv').data('isFileUpload', true);

        $('#fileUploadSpan').show();
        $('#uploadModeSpan').show();
        $('#radarInfoSpan').hide();
        $('#currentModeSpan').hide();

        $('#radarHeader').css('height', '+=25px')
        $('.progressBar').css('top', '+=25px');
    } else if (showHide == 'hide') {
        // current data mode
        $('#dataDiv').data('isFileUpload', false);

        $('#fileUploadSpan').hide();
        $('#uploadModeSpan').hide();
        $('#radarInfoSpan').show();
        $('#currentModeSpan').show();

        $('#radarHeader').css('height', '-=25px');
        $('.progressBar').css('top', '-=25px');
    }
}

createOffCanvasItem({
    'id': 'modeMenuItem',
    'class': 'alert alert-success offCanvasMenuItem',
    'contents': 'Current File Mode',
    'icon': 'fa fa-clock',
    'css': ''
}, function(thisObj, innerDiv, iconElem) {
    if ($(thisObj).hasClass('alert-success')) {
        $(thisObj).removeClass('alert-success');
        $(thisObj).addClass('alert-danger');

        iconElem.className = 'fa fa-upload';
        innerDiv.innerHTML = 'Upload File Mode';

        showHideFileBox('show');
    } else if ($(thisObj).hasClass('alert-danger')) {
        $(thisObj).removeClass('alert-danger');
        $(thisObj).addClass('alert-success');

        iconElem.className = 'fa fa-clock';
        innerDiv.innerHTML = 'Current File Mode';

        showHideFileBox('hide');
    }
})