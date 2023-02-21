const createMenuOption = require('./createMenuOption');
const createOffCanvasItem = require('./createOffCanvasItem');
const armFunctions = require('./atticRadarMenu');
const ut = require('../utils');

function showHideFileBox(showHide) {
    $('#stationMenuItemIcon').click();
    if (showHide == 'show') {
        // file mode
        $('#dataDiv').data('isFileUpload', true);

        $('#fileUploadSpan').show();
        // $('#uploadModeSpan').show();
        // //$('#radarInfoSpan').hide();
        // $('#currentModeSpan').hide();

        $('#radarHeader').css('height', '+=25px')
        $('.progressBar').css('top', '+=25px');
        ut.setMapMargin('top', '+=25px');
    } else if (showHide == 'hide') {
        // current data mode
        $('#dataDiv').data('isFileUpload', false);

        $('#fileUploadSpan').hide();
        // $('#uploadModeSpan').hide();
        // //$('#radarInfoSpan').show();
        // $('#currentModeSpan').show();

        $('#radarHeader').css('height', '-=25px');
        $('.progressBar').css('top', '-=25px');
        ut.setMapMargin('top', '-=25px');
    }
}

$('#armrModeBtn').click(function() {
    var armrModeBtn = $(this);
    var armrModeBtnSlideDown = $('#armrModeBtnSlideDown');
    armFunctions.slideDownToggle(armrModeBtn, armrModeBtnSlideDown);
})

armFunctions.toggleswitchFunctions($('#armrModeBtnSwitchElem'), function() {
    if (!$('#dataDiv').data('noMoreClicks')) {
        $('#armrModeBtnSlideDown')
            // change text to red
            .removeClass('armrText-Green')
            .addClass('armrText-Red')
        .find('.armrIcon')
            // change to a red upload icon
            .removeClass('armrIcon-Green fa-clock')
            .addClass('armrIcon-Red fa-upload');
        // change the text
        $('#armrModeBtnSlideDown').find('.slideDownText').text('File Upload Mode');
        showHideFileBox('show');
    }
}, function() {
    if (!$('#dataDiv').data('noMoreClicks')) {
        $('#armrModeBtnSlideDown')
            // change text to green
            .removeClass('armrText-Red')
            .addClass('armrText-Green')
        .find('.armrIcon')
            // change to a green clock icon
            .removeClass('armrIcon-Red fa-upload')
            .addClass('armrIcon-Green fa-clock');
        // change the text
        $('#armrModeBtnSlideDown').find('.slideDownText').text('Current File Mode');
        showHideFileBox('hide');
    }
})

// createOffCanvasItem({
//     'id': 'modeMenuItem',
//     'class': 'alert alert-success offCanvasMenuItem',
//     'contents': 'Current File Mode',
//     'icon': 'fa fa-clock',
//     'css': '',
//     'provideOwnHoverFunctions': true
// }, function(thisObj, innerDiv, iconElem) {
//     if (!$('#dataDiv').data('noMoreClicks')) {
//         if ($(thisObj).hasClass('alert-success')) {
//             $(thisObj).removeClass('alert-success');
//             $(thisObj).addClass('alert-danger');

//             iconElem.className = 'fa fa-upload';
//             innerDiv.innerHTML = 'Upload File Mode';

//             showHideFileBox('show');
//         } else if ($(thisObj).hasClass('alert-danger')) {
//             $(thisObj).removeClass('alert-danger');
//             $(thisObj).addClass('alert-success');

//             iconElem.className = 'fa fa-clock';
//             innerDiv.innerHTML = 'Current File Mode';

//             showHideFileBox('hide');
//         }
//     }
// }, function(mode, div) {
//     if (!$('#dataDiv').data('noMoreClicks')) {
//         if (mode == 'mouseenter') {
//             ut.animateBrightness(100, 80, 100, div);
//         } else if (mode == 'mouseleave') {
//             ut.animateBrightness(80, 100, 100, div);
//         }
//     }
// })