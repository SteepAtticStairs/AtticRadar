const { Level2Radar } = require('../../../nexrad-level-2-data/src');
const { plot } = require('../../../nexrad-level-2-plot/src');
const l2listeners = require('../level2/eventListeners');
const l2info = require('../dom/l2info');

const ut = require('../utils');

function mainL2Loading(thisObj) {
    var l2rad = new Level2Radar(ut.toBuffer(thisObj.result));
    console.log(l2rad);

    l2info(l2rad);

    plot(l2rad, 'REF', {
        elevations: 1,
    });

    l2listeners(l2rad);
}

module.exports = mainL2Loading;