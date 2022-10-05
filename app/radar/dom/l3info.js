const addDays = require('../utils').addDays;
const ut = require('../utils');
const getLevel3FileTime = require('../level3/l3fileTime');

function showL3Info(l3rad) {// //showPlotBtn();
    $('#fileUploadSpan').hide();
    $('#radarInfoSpan').show();
    // document.getElementById('fileInput').style.display = 'none';
    // document.getElementById('radarInfoDiv').style.display = 'inline';

    // document.getElementById('radFileName').innerHTML = uploadedFile.name;

    $.getJSON('https://steepatticstairs.github.io/AtticRadar/resources/stationAbbreviations.json', function(abrvData) {
		var theFileStation = abrvData[l3rad.textHeader.id3];
        //document.getElementById('radarStation').innerHTML = theFileStation;

        var theFileVCP = l3rad.productDescription.vcp;
        document.getElementById('radarVCP').innerHTML = `${theFileVCP} (${ut.vcpObj[theFileVCP]})`;

        var fileDateObj = getLevel3FileTime(l3rad);
        var finalRadarDateTime = ut.printFancyTime(fileDateObj, ut.userTimeZone);

        document.getElementById('radarTime').innerHTML = `&nbsp;&nbsp;${finalRadarDateTime}`;

        function showTimeDiff() {
            const dateDiff = ut.getDateDiff(fileDateObj, new Date());
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
            document.getElementById('top-right').innerHTML = formattedDateDiff;
        }
        if (window.countInterval) {
            clearInterval(window.countInterval)
        }
        showTimeDiff();
        // update the time difference every 10 seconds
        window.countInterval = setInterval(showTimeDiff, 10000);

        if ($('#dataDiv').data('fromFileUpload')) {
            // shrink the map header because the file upload box is no longer there
            $('#radarHeader').css('height', '-=25px');
            $('.progressBar').css('top', '-=25px');
            $('#productsSelectionMenu').html('<b>No product selections avaliable for a Level 3 file.</b>')
        }
    })
}

module.exports = showL3Info;