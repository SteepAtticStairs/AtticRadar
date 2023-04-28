const createMenuOption = require('./createMenuOption');
const createOffCanvasItem = require('./createOffCanvasItem');
const armFunctions = require('./atticRadarMenu');
const ut = require('../utils');
const show_hide_upload_menu = require('../upload/OLD_upload_menu');


$('#armrModeBtn').click(function() {
    var armrModeBtn = $(this);
    var armrModeBtnSlideDown = $('#armrModeBtnSlideDown');
    armFunctions.slideDownToggle(armrModeBtn, armrModeBtnSlideDown);
})

armFunctions.toggleswitchFunctions($('#armrModeBtnSwitchElem'), function() {
    // if (!$('#dataDiv').data('noMoreClicks')) {
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
        show_hide_upload_menu('show');
    // }
}, function() {
    // if (!$('#dataDiv').data('noMoreClicks')) {
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
        show_hide_upload_menu('hide');
    // }
})