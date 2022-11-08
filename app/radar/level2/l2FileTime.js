const addDays = require('../utils').addDays;
const ut = require('../utils');
const { DateTime } = require('luxon');

function getLevel2FileTime(l2rad) {
    var modifiedJulianDate = l2rad.header.modified_julian_date;

    // page 14 - https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620001Y.pdf
    // page 16 - https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620002U.pdf
    var julianDate = modifiedJulianDate + 2440586.5;
    // https://stackoverflow.com/a/36073807
    var millis = (julianDate - 2440587.5) * 86400000;

    var theFileTime = l2rad.header.milliseconds;
    var fileDateObj = DateTime.fromMillis(millis).toJSDate();
    var fileHours = ut.msToTime(theFileTime).hours;
    var fileMinutes = ut.msToTime(theFileTime).minutes;
    var fileSeconds = ut.msToTime(theFileTime).seconds;
    fileDateObj.setUTCHours(fileHours);
    fileDateObj.setUTCMinutes(fileMinutes);
    fileDateObj.setUTCSeconds(fileSeconds);

    return fileDateObj;

    // var theFileDate = l2rad.header.modified_julian_date;
    // var theFileTime = l2rad.header.milliseconds;
    // var fileDateObj = addDays(new Date(0), theFileDate);
    // var fileHours = ut.msToTime(theFileTime).hours;
    // var fileMinutes = ut.msToTime(theFileTime).minutes;
    // var fileSeconds = ut.msToTime(theFileTime).seconds;
    // fileDateObj.setUTCHours(fileHours);
    // fileDateObj.setUTCMinutes(fileMinutes);
    // fileDateObj.setUTCSeconds(fileSeconds);
}

module.exports = getLevel2FileTime;