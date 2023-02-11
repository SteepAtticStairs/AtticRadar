const addDays = require('../utils').addDays;
const ut = require('../utils');
const getLevel2FileTime = require('../level2/l2FileTime');
const getTimeDiff = require('../misc/getTimeDiff');
const radarStationInfo = require('../radar-message/radarStationInfo');
const { DateTime } = require('luxon');

var alreadyClicked = false;
function showL2Info(l2rad) {
    if (!alreadyClicked) {
        alreadyClicked = true;
        var offset;
        if (require('../misc/detectmobilebrowser')) {
            offset = $(window).height() * (5 / 100);
        } else {
            offset = 0;
        }
        $('#productMapFooter').show();
        //$('#productMapFooter').height('30px');
        var productFooterBottomMargin = parseInt($('#map').css('bottom'));
        var productFooterHeight = parseInt($('#productMapFooter').height());
        $('#productMapFooter').css('bottom', productFooterBottomMargin - offset);
        ut.setMapMargin('bottom', productFooterBottomMargin + productFooterHeight);
    }

    $('#fileUploadSpan').hide();
    $('#radarInfoSpan').show();

    var theFileVersion = l2rad.header.version;

    var theFileStation = l2rad.header.ICAO;
    $('#radarStationIcon').show();
    document.getElementById('radarStation').innerHTML = theFileStation;
    document.getElementById('radarLocation').innerHTML = radarStationInfo[theFileStation].name;
    $('#radarInfoSpan').show();

    $('#productsDropdownTrigger').show();

    var theFileVCP;
    if (theFileVersion != "01" && theFileVersion != "E2") {
        theFileVCP = l2rad.vcp.record.pattern_number;
    } else {
        theFileVCP = l2rad.data[1][0].record.vcp;
    }
    document.getElementById('radarVCP').innerHTML = `${theFileVCP} (${ut.vcpObj[theFileVCP]})`;

    var fileDateObj = getLevel2FileTime(l2rad);
    var formattedDateObj = DateTime.fromJSDate(fileDateObj).setZone(ut.userTimeZone);
    var formattedRadarDate = formattedDateObj.toFormat('L/d/yyyy');
    var formattedRadarTime = formattedDateObj.toFormat('h:mm a ZZZZ');

    $('#radarDateTime').show().html(`${formattedRadarDate}<br>${formattedRadarTime}`);
    // var finalRadarDateTime = ut.printFancyTime(fileDateObj, ut.userTimeZone);
    // document.getElementById('radarTime').innerHTML = `&nbsp;&nbsp;${finalRadarDateTime}`;

    getTimeDiff(fileDateObj);

    if ($('#dataDiv').data('fromFileUpload')) {
        document.getElementById('top-right').innerHTML += ' ago';
        $('#top-right').addClass('uploaded-file');
        // shrink the map header because the file upload box is no longer there
        $('#radarHeader').css('height', '-=25px');
        $('.progressBar').css('top', '-=25px');
        ut.setMapMargin('top', '-=25px');
    }
}

module.exports = showL2Info;