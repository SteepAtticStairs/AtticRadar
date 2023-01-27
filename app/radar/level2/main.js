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

        // var velocities = [];
        // const nyquist = l2rad.data[2][0].record.radial.nyquist_velocity / 100;
        // for (var i in l2rad.data[2]) { velocities.push(l2rad.data[2][i].record.velocity.moment_data) }

        // var dealiased = [];
        // for (var i = 0; i < velocities.length; i++) {
        //     dealiased[i] = [];
        // }

        // function switchSign(n) { return n - (n * 2) }

        // for (var i in velocities) {
        //     if (i >= 250 && i <= 270) { // i == 262
        //         dealiased[i] = velocities[i]
        //         for (var n in velocities[i]) {
        //             var curGate = velocities[i][n];
        //             var prevGate = velocities[i][parseInt(n) - 1];

        //             var diff = Math.abs(curGate - prevGate);
        //             var correctedVal = curGate;
        //             if (diff > nyquist) {
        //                 //correctedVal = -50;
        //                 correctedVal = switchSign(correctedVal);
        //             }

        //             // if (i >= 250 && i <= 270) { dealiased[i][n] = velocities[i][n] }
        //             dealiased[i][n] = correctedVal;
        //         }
        //     }
        // }
        // // lng: -97.51734430176083, lat: 35.316678641320166
        // // map.on('move', (e) => { console.log(map.getZoom()) })
        // map.jumpTo({center: [-97.51734430176083, 35.316678641320166], zoom: 11});

        // //console.log(dealiased)
        // for (var i in dealiased) { l2rad.data[2][i].record.velocity.moment_data = dealiased[i] }

        l2info(l2rad);

        l2plot(l2rad, 'REF', 1);
        //l2plot(l2rad, 'VEL', 2);
        // plot(l2rad, 'REF', {
        //     elevations: 1,
        // });

        loadL2Menu(l2rad.listElevationsAndProducts(), l2rad);

        //l2listeners(l2rad);
    });
}

module.exports = mainL2Loading;