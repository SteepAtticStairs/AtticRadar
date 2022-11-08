const addDays = require('../utils').addDays;
const ut = require('../utils');
const getLevel2FileTime = require('../level2/l2FileTime');
const getTimeDiff = require('../misc/getTimeDiff');

function showL2Info(l2rad) {
    $('#fileUploadSpan').hide();
    $('#radarInfoSpan').show();

    var theFileVersion = l2rad.header.version;

    var theFileStation = l2rad.header.ICAO;
    $('#radarStationIcon').show();
    document.getElementById('radarStation').innerHTML = theFileStation;

    $('#productsDropdownTrigger').show();

    var theFileVCP;
    if (theFileVersion != "01" && theFileVersion != "E2") {
        theFileVCP = l2rad.vcp.record.pattern_number;
    } else {
        theFileVCP = l2rad.data[1][0].record.vcp;
    }
    document.getElementById('radarVCP').innerHTML = `${theFileVCP} (${ut.vcpObj[theFileVCP]})`;

    var fileDateObj = getLevel2FileTime(l2rad);
    var finalRadarDateTime = ut.printFancyTime(fileDateObj, ut.userTimeZone);

    document.getElementById('radarTime').innerHTML = `&nbsp;&nbsp;${finalRadarDateTime}`;

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