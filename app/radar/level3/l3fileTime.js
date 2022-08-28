const addDays = require('../utils').addDays;
const ut = require('../utils');

function getLevel3FileTime(l3rad) {
    var theFileDate = l3rad.messageHeader.julianDate;
    var theFileTime = l3rad.messageHeader.seconds * 1000;
    var fileDateObj = addDays(new Date(0), theFileDate);
    var fileHours = ut.msToTime(theFileTime).hours;
    var fileMinutes = ut.msToTime(theFileTime).minutes;
    var fileSeconds = ut.msToTime(theFileTime).seconds;
    fileDateObj.setUTCHours(fileHours);
    fileDateObj.setUTCMinutes(fileMinutes);
    fileDateObj.setUTCSeconds(fileSeconds);

    return fileDateObj;
}

module.exports = getLevel3FileTime;