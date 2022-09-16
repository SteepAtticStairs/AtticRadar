const createMenuOption = require('./createMenuOption');

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
    } else if (showHide == 'hide') {
        // current data mode
        $('#dataDiv').data('isFileUpload', false);

        $('#fileUploadSpan').hide();
        $('#uploadModeSpan').hide();
        $('#radarInfoSpan').show();
        $('#currentModeSpan').show();

        $('#radarHeader').css('height', '-=25px')
    }
}

createMenuOption({
    'divId': 'modeMenuItemDiv',
    'iconId': 'modeMenuItemClass',

    'divClass': 'mapFooterMenuItem',
    'iconClass': 'icon-green',

    'contents': 'Current File Mode',
    'icon': 'fa fa-clock',
    'css': ''
}, function(divElem, iconElem) {
    if (!$('#dataDiv').data('noMoreClicks')) {
        if ($(iconElem).hasClass('icon-green')) {
            $(iconElem).removeClass('icon-green');
            $(iconElem).addClass('icon-red');

            $(iconElem).removeClass('fa-clock');
            $(iconElem).addClass('fa-upload');
            //innerDiv.innerHTML = 'Upload File Mode';

            showHideFileBox('show');
        } else if ($(iconElem).hasClass('icon-red')) {
            $(iconElem).removeClass('icon-red');
            $(iconElem).addClass('icon-green');

            $(iconElem).removeClass('fa-upload');
            $(iconElem).addClass('fa-clock');
            //innerDiv.innerHTML = 'Current File Mode';

            showHideFileBox('hide');
        }
    }
})