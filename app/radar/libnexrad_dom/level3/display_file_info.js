const nexrad_locations = require('../../libnexrad/nexrad_locations').NEXRAD_LOCATIONS;
const { DateTime } = require('luxon');
const ut = require('../../utils');

var alreadyClicked = false;
function _position_footer() {
    if (!alreadyClicked) {
        alreadyClicked = true;
        var offset;
        if (require('../../misc/detectmobilebrowser')) {
            offset = $(window).height() * (5 / 100);
        } else {
            offset = 0;
        }
        // show the parent div for the PSM
        $('#productMapFooter').show();
        //$('#productMapFooter').height('30px');
        var productFooterBottomMargin = parseInt($('#map').css('bottom'));
        var productFooterHeight = parseInt($('#productMapFooter').height());
        $('#productMapFooter').css('bottom', productFooterBottomMargin - offset);
        ut.setMapMargin('bottom', productFooterBottomMargin + productFooterHeight);
    }
}

function _display_time_diff() {
    const dateDiff = ut.getDateDiff(this.get_date(), new Date());
    var formattedDateDiff;
    if (dateDiff.s) { formattedDateDiff = `${dateDiff.s}s`; }
    if (dateDiff.m) { formattedDateDiff = `${dateDiff.m}m ${dateDiff.s}s`; }
    if (dateDiff.h) { formattedDateDiff = `${dateDiff.h}h ${dateDiff.m}m`; }
    if (dateDiff.d) { formattedDateDiff = `${dateDiff.d}d ${dateDiff.h}h`; }

    $('#top-right').removeClass();
    // greater than 1 hour or 1 day OR greater than or equal to 0 hours 30 minutes
    if (dateDiff.h > 0 || dateDiff.d > 0 || (dateDiff.h == 0 && dateDiff.m >= 30)) { $('#top-right').addClass('old-file'); }
    // greater than or equal to 0 hours 10 minutes
    if (dateDiff.h == 0 && dateDiff.m >= 10) { $('#top-right').addClass('recent-file'); }
    // less than 0 hours 10 minutes
    if (dateDiff.h == 0 && dateDiff.m < 10) { $('#top-right').addClass('new-file'); }
    $('#top-right').html(formattedDateDiff);
}

/**
 * This function is called using ".apply()", so "this" is a reference to an instance of the L3Factory class.
 */
function display_file_info() {
    _position_footer();

    // make sure the file upload stuff is hidden
    $('#fileUploadSpan').hide();
    $('#radarInfoSpan').show();

    // set some DOM content
    $('#radarStation').html(this.station);
    $('#radarLocation').html(nexrad_locations[this.station].name);

    // set the date box content
    var fileDateObj = this.get_date();
    var formattedDateObj = DateTime.fromJSDate(fileDateObj).setZone(ut.userTimeZone);
    var formattedRadarDate = formattedDateObj.toFormat('L/d/yyyy');
    var formattedRadarTime = formattedDateObj.toFormat('h:mm a ZZZZ');
    $('#radarDateTime').show().html(`${formattedRadarDate}<br>${formattedRadarTime}`);
    // display the time difference
    _display_time_diff.apply(this);

    // show the main box containing station name, vcp, etc.
    $('#radarInfoSpan').show();

    // show the text to open the product selection menu
    $('#productsDropdownTrigger').show();

    // display the VCP
    $('#radarVCP').html(`VCP: ${this.vcp} (${ut.vcpObj[this.vcp]})`);

    // display the elevation angle
    $('#extraProductInfo').show().html(`Elevation: ${this.elevation_angle}°`);

    // function showTimeDiff() { getTimeDiff(fileDateObj) }
    // if (window.countInterval && !$('#dataDiv').data('fromFileUpload')) {
    //     clearInterval(window.countInterval)
    // }
    // showTimeDiff();
    // // update the time difference every 10 seconds
    // if (!$('#dataDiv').data('fromFileUpload')) { window.countInterval = setInterval(showTimeDiff, 10000) }
    // if ($('#dataDiv').data('fromFileUpload')) {
    //     document.getElementById('top-right').innerHTML += ' ago';
    //     $('#top-right').addClass('uploaded-file');
    //     // shrink the map header because the file upload box is no longer there
    //     $('#radarHeader').css('height', '-=25px');
    //     $('.progressBar').css('top', '-=25px');
    //     ut.setMapMargin('top', '-=25px');
    //     $('#productsSelectionMenu').html('<b>No product selections avaliable for a Level 3 file.</b>')
    // }
}

module.exports = display_file_info;