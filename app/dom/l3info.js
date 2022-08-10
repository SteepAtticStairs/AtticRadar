const addDays = require('../utils').addDays;
const ut = require('../utils');

function showL3Info(l3rad) {// //showPlotBtn();
    // document.getElementById('fileInput').style.display = 'none';
    // document.getElementById('radarInfoDiv').style.display = 'inline';

    // document.getElementById('radFileName').innerHTML = uploadedFile.name;

    var theFileStation = 'K' + l3rad.textHeader.id3;
    document.getElementById('radarStation').innerHTML = theFileStation;

    var theFileVCP = l3rad.productDescription.vcp;
    document.getElementById('radarVCP').innerHTML = theFileVCP;

    var theFileDate = l3rad.messageHeader.julianDate;
    var theFileTime = l3rad.messageHeader.seconds * 1000;
    var fileDateObj = addDays(new Date(0), theFileDate);
    var fileHours = ut.msToTime(theFileTime).hours;
    var fileMinutes = ut.msToTime(theFileTime).minutes;
    var fileSeconds = ut.msToTime(theFileTime).seconds;
    fileDateObj.setUTCHours(fileHours);
    fileDateObj.setUTCMinutes(fileMinutes);
    fileDateObj.setUTCSeconds(fileSeconds);
    var finalRadarDateTime = ut.printFancyTime(fileDateObj, ut.userTimeZone);

    document.getElementById('radarTime').innerHTML = finalRadarDateTime;
}

module.exports = showL3Info;