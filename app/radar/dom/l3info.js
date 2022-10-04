const addDays = require('../utils').addDays;
const ut = require('../utils');
const getLevel3FileTime = require('../level3/l3fileTime');

// https://stackoverflow.com/a/544429/18758797
function getDateDiff(date1, date2) {
    var diff = Date.parse( date2 ) - Date.parse( date1 ); 
    return isNaN( diff ) ? NaN : {
        //diff : diff,
        ms : Math.floor( diff            % 1000 ),
        s  : Math.floor( diff /     1000 %   60 ),
        m  : Math.floor( diff /    60000 %   60 ),
        h  : Math.floor( diff /  3600000 %   24 ),
        d  : Math.floor( diff / 86400000        )
    };
}

function showL3Info(l3rad) {// //showPlotBtn();
    $('#fileUploadSpan').hide();
    $('#radarInfoSpan').show();
    // document.getElementById('fileInput').style.display = 'none';
    // document.getElementById('radarInfoDiv').style.display = 'inline';

    // document.getElementById('radFileName').innerHTML = uploadedFile.name;

    $.getJSON('https://steepatticstairs.github.io/AtticRadar/resources/stationAbbreviations.json', function(abrvData) {
		var theFileStation = abrvData[l3rad.textHeader.id3];
        document.getElementById('radarStation').innerHTML = theFileStation;

        var theFileVCP = l3rad.productDescription.vcp;
        document.getElementById('radarVCP').innerHTML = `${theFileVCP} (${ut.vcpObj[theFileVCP]})`;

        var fileDateObj = getLevel3FileTime(l3rad);
        var finalRadarDateTime = ut.printFancyTime(fileDateObj, ut.userTimeZone);

        document.getElementById('radarTime').innerHTML = `&nbsp;&nbsp;${finalRadarDateTime}`;

        const dateDiff = getDateDiff(fileDateObj, new Date());
        var formattedDateDiff;
        if (dateDiff.s) { formattedDateDiff = `${dateDiff.s}s`; }
        if (dateDiff.m) { formattedDateDiff = `${dateDiff.m}m ${dateDiff.s}s`; }
        if (dateDiff.h) { formattedDateDiff = `${dateDiff.h}h ${dateDiff.m}m`; }
        if (dateDiff.d) { formattedDateDiff = `${dateDiff.d}d ${dateDiff.h}h`; }

        $('#top-right').removeClass();
        if (dateDiff.m >= 30) { $('#top-right').addClass('old-file'); }
        if (dateDiff.m >= 10) { $('#top-right').addClass('recent-file'); }
        if (dateDiff.m < 10) { $('#top-right').addClass('new-file'); }
        document.getElementById('top-right').innerHTML = formattedDateDiff;

        if ($('#dataDiv').data('fromFileUpload')) {
            // shrink the map header because the file upload box is no longer there
            $('#radarHeader').css('height', '-=25px');
            $('.progressBar').css('top', '-=25px');
            $('#productsSelectionMenu').html('<b>No product selections avaliable for a Level 3 file.</b>')
        }
    })
}

module.exports = showL3Info;