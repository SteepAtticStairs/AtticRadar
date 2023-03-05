const dealias = require('./dealias');

function _generate2dArray(l2rad, scanNumber) {
    var velocities = [];
    for (var i in l2rad.data[scanNumber]) { velocities.push(l2rad.data[scanNumber][i].record.velocity.moment_data) }
    return velocities;
}
function _getNyquist(l2rad, scanNumber) {
    var nyquist = l2rad.data[scanNumber][0].record.radial.nyquist_velocity / 100;
    return nyquist;
}
function _mergeCorrectedVelocities(correctedVelocities, l2rad, scanNumber) {
    for (var i in correctedVelocities) { l2rad.data[scanNumber][i].record.velocity.dealias_data = correctedVelocities[i] }
    return l2rad;
}

function checkIfAlreadyDealiased(l2rad, scanNumber) {
    if (l2rad?.data?.[scanNumber]?.[0]?.record?.velocity?.dealias_data != undefined) {
        return true;
    } else {
        return false;
    }
}

function dealiasRadarObject(l2rad, scanNumber) {
    var velocities = _generate2dArray(l2rad, scanNumber);
    var nyquist = _getNyquist(l2rad, scanNumber);
    var corrected_velocities = dealias(velocities, nyquist);
    l2rad = _mergeCorrectedVelocities(corrected_velocities, l2rad, scanNumber);
    return l2rad;
}

module.exports = {
    _generate2dArray,
    _getNyquist,
    _mergeCorrectedVelocities,
    checkIfAlreadyDealiased,
    dealiasRadarObject
}