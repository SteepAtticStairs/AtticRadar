const addDays = require('../utils').addDays;
const ut = require('../utils');

function showL2Info(l2rad) {
    $('#fileUploadSpan').hide();
    $('#radarInfoSpan').show();

    var theFileVersion = l2rad.header.version;

    var theFileStation = l2rad.header.ICAO;
    document.getElementById('radarStation').innerHTML = theFileStation;

    var theFileVCP;
    if (theFileVersion != "01" && theFileVersion != "E2") {
        theFileVCP = l2rad.vcp.record.pattern_number;
    } else {
        theFileVCP = l2rad.data[1][0].record.vcp;
    }
    document.getElementById('radarVCP').innerHTML = `${theFileVCP} (${ut.vcpObj[theFileVCP]})`;

    var theFileDate = l2rad.header.modified_julian_date;
    var theFileTime = l2rad.header.milliseconds;
    var fileDateObj = addDays(new Date(0), theFileDate);
    var fileHours = ut.msToTime(theFileTime).hours;
    var fileMinutes = ut.msToTime(theFileTime).minutes;
    var fileSeconds = ut.msToTime(theFileTime).seconds;
    fileDateObj.setUTCHours(fileHours);
    fileDateObj.setUTCMinutes(fileMinutes);
    fileDateObj.setUTCSeconds(fileSeconds);
    var finalRadarDateTime = ut.printFancyTime(fileDateObj, "UTC");

    document.getElementById('radarTime').innerHTML = `&nbsp;&nbsp;${finalRadarDateTime}`;

    if ($('#dataDiv').data('fromFileUpload')) {
        // shrink the map header because the file upload box is no longer there
        $('#radarHeader').css('height', '-=25px')
    }
}

module.exports = showL2Info;