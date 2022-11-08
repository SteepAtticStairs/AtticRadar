const ut = require('../utils');

function getTimeDiff(fileDateObj) {
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

module.exports = getTimeDiff;