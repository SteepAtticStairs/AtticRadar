const addDays = require('../utils').addDays;
const ut = require('../utils');
const { DateTime } = require('luxon');

function getLevel3FileTime(l3rad) {
    var modifiedJulianDate = l3rad.messageHeader.julianDate;

    // page 14 - https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620001Y.pdf
    var julianDate = modifiedJulianDate + 2440586.5;
    // https://stackoverflow.com/a/36073807
    var millis = (julianDate - 2440587.5) * 86400000;

    var theFileTime = l3rad.messageHeader.seconds * 1000;
    var fileDateObj = DateTime.fromMillis(millis).toJSDate();
    var fileHours = ut.msToTime(theFileTime).hours;
    var fileMinutes = ut.msToTime(theFileTime).minutes;
    var fileSeconds = ut.msToTime(theFileTime).seconds;
    fileDateObj.setUTCHours(fileHours);
    fileDateObj.setUTCMinutes(fileMinutes);
    fileDateObj.setUTCSeconds(fileSeconds);

    return fileDateObj;
}

module.exports = getLevel3FileTime;