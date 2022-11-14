const addDays = require('../utils').addDays;
const ut = require('../utils');
const getLevel3FileTime = require('../level3/l3fileTime');
const getTimeDiff = require('../misc/getTimeDiff');
const stationAbbreviations = require('../../../resources/stationAbbreviations');

function showL3Info(l3rad) {// //showPlotBtn();
    $('#fileUploadSpan').hide();
    $('#radarInfoSpan').show();
    // document.getElementById('fileInput').style.display = 'none';
    // document.getElementById('radarInfoDiv').style.display = 'inline';

    // document.getElementById('radFileName').innerHTML = uploadedFile.name;

    var theFileStation = stationAbbreviations[l3rad.textHeader.id3];
    $('#radarStationIcon').show();
    document.getElementById('radarStation').innerHTML = theFileStation;

    $('#productsDropdownTrigger').show();

    var theFileVCP = l3rad.productDescription.vcp;
    document.getElementById('radarVCP').innerHTML = `${theFileVCP} (${ut.vcpObj[theFileVCP]})`;

    var fileDateObj = getLevel3FileTime(l3rad);
    var finalRadarDateTime = ut.printFancyTime(fileDateObj, ut.userTimeZone);

    document.getElementById('radarTime').innerHTML = `&nbsp;&nbsp;${finalRadarDateTime}`;

    function showTimeDiff() { getTimeDiff(fileDateObj) }
    if (window.countInterval && !$('#dataDiv').data('fromFileUpload')) {
        clearInterval(window.countInterval)
    }
    showTimeDiff();
    // update the time difference every 10 seconds
    if (!$('#dataDiv').data('fromFileUpload')) { window.countInterval = setInterval(showTimeDiff, 10000) }

    if ($('#dataDiv').data('fromFileUpload')) {
        document.getElementById('top-right').innerHTML += ' ago';
        $('#top-right').addClass('uploaded-file');
        // shrink the map header because the file upload box is no longer there
        $('#radarHeader').css('height', '-=25px');
        $('.progressBar').css('top', '-=25px');
        ut.setMapMargin('top', '-=25px');
        $('#productsSelectionMenu').html('<b>No product selections avaliable for a Level 3 file.</b>')
    }
}

module.exports = showL3Info;