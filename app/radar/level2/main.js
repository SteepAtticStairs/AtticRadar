const { Level2Radar } = require('../../../lib/nexrad-level-2-data/src');
const { plot } = require('../../../lib/nexrad-level-2-plot/src');
const l2listeners = require('../level2/eventListeners').loadL2Listeners;
const l2info = require('../dom/l2info');
const l2plot = require('./l2plot');

const loadL2Menu = require('./loadL2Menu');

const ut = require('../utils');

function mainL2Loading(thisObj) {
    var l2rad = new Level2Radar(ut.toBuffer(thisObj.result), function(l2rad) {
        console.log(l2rad);

        l2info(l2rad);

        l2plot(l2rad, 'REF', 1);
        // plot(l2rad, 'REF', {
        //     elevations: 1,
        // });

        loadL2Menu(l2rad.listElevationsAndProducts(), l2rad);

        //l2listeners(l2rad);
    });
}

module.exports = mainL2Loading;