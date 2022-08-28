const addDays = require('../utils').addDays;
const ut = require('../utils');
const getLevel3FileTime = require('../level3/l3fileTime');

function showL3Info(l3rad) {// //showPlotBtn();
    $('#fileUploadSpan').hide();
    $('#radarInfoSpan').show();
    // document.getElementById('fileInput').style.display = 'none';
    // document.getElementById('radarInfoDiv').style.display = 'inline';

    // document.getElementById('radFileName').innerHTML = uploadedFile.name;

    $.getJSON('https://steepatticstairs.github.io/NexradJS/resources/stationAbbreviations.json', function(abrvData) {
		var theFileStation = abrvData[l3rad.textHeader.id3];
        document.getElementById('radarStation').innerHTML = theFileStation;

        var theFileVCP = l3rad.productDescription.vcp;
        document.getElementById('radarVCP').innerHTML = `${theFileVCP} (${ut.vcpObj[theFileVCP]})`;

        var fileDateObj = getLevel3FileTime(l3rad);
        var finalRadarDateTime = ut.printFancyTime(fileDateObj, ut.userTimeZone);

        document.getElementById('radarTime').innerHTML = finalRadarDateTime;
    })
}

module.exports = showL3Info;