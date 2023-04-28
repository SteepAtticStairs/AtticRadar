const ut = require('../utils');

function show_hide_upload_menu(show_hide) {
    // $('#stationMenuItemIcon').click();
    if (show_hide == 'show') {
        // file mode
        // $('#dataDiv').data('isFileUpload', true);

        $('#fileUploadSpan').show();
        $('#radarInfoSpan').hide();
        // $('#uploadModeSpan').show();
        // //$('#radarInfoSpan').hide();
        // $('#currentModeSpan').hide();

        $('#radarHeader').css('height', '+=25px')
        $('.progressBar').css('top', '+=25px');
        ut.setMapMargin('top', '+=25px');
    } else if (show_hide == 'hide') {
        // current data mode
        // $('#dataDiv').data('isFileUpload', false);

        $('#fileUploadSpan').hide();
        $('#radarInfoSpan').show();
        // $('#uploadModeSpan').hide();
        // //$('#radarInfoSpan').show();
        // $('#currentModeSpan').show();

        $('#radarHeader').css('height', '-=25px');
        $('.progressBar').css('top', '-=25px');
        ut.setMapMargin('top', '-=25px');
    }
}

module.exports = show_hide_upload_menu;