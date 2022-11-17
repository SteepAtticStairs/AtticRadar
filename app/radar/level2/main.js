const { Level2Radar } = require('../../../lib/nexrad-level-2-data/src');
const { plot } = require('../../../lib/nexrad-level-2-plot/src');
const l2listeners = require('../level2/eventListeners');
const l2info = require('../dom/l2info');

const loadL2Menu = require('./loadL2Menu');

const ut = require('../utils');

function mainL2Loading(thisObj) {
    var l2rad = new Level2Radar(ut.toBuffer(thisObj.result), function(l2rad) {
        console.log(l2rad);

        l2info(l2rad);

        plot(l2rad, 'VEL', {
            elevations: 2,
        });

        l2listeners(l2rad);

        loadL2Menu(l2rad.listElevationsAndProducts());
    });
}

module.exports = mainL2Loading;