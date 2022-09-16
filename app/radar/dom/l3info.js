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
        document.getElementById('radarStation').innerHTML = theFileStation;

        var theFileVCP = l3rad.productDescription.vcp;
        document.getElementById('radarVCP').innerHTML = `${theFileVCP} (${ut.vcpObj[theFileVCP]})`;

        var fileDateObj = getLevel3FileTime(l3rad);
        var finalRadarDateTime = ut.printFancyTime(fileDateObj, ut.userTimeZone);

        document.getElementById('radarTime').innerHTML = `&nbsp;&nbsp;${finalRadarDateTime}`;

        if ($('#dataDiv').data('fromFileUpload')) {
            // shrink the map header because the file upload box is no longer there
            $('#radarHeader').css('height', '-=25px')
        }

        $('#productsSelectionMenu').html('<b>No product selections avaliable for a Level 3 file.</b>')
    })
}

module.exports = showL3Info;