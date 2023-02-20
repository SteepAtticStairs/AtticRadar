const { Level2Radar } = require('../../../lib/nexrad-level-2-data/src');
const { plot } = require('../../../lib/nexrad-level-2-plot/src');
const l2listeners = require('../level2/eventListeners').loadL2Listeners;
const l2info = require('./l2info');
const l2plot = require('./l2plot');

const loadL2Menu = require('./loadL2Menu');

const ut = require('../utils');

function upscaleTest(l2rad) {
    // l2rad.data[8] = l2rad.data[8].map(num => [num, num]).flat();
    // var isOrig = true;
    // for (var i in l2rad.data[8]) {
    //     try {
    //         if (isOrig) {
    //             isOrig = false;
    //             // continue;
    //         } else {
    //             isOrig = true;

    //             var curOrigValues = l2rad.data[8][i].record.reflect.moment_data;
    //             //var nextInterpValues = l2rad.data[8][parseInt(i) + 1].record.reflect.moment_data;
    //             var nextOrigValues = l2rad.data[8][parseInt(i) + 2].record.reflect.moment_data;
    //             for (var n in curOrigValues) {
    //                 if (curOrigValues[n] != null && nextOrigValues[n] != null) {
    //                     var interp = (curOrigValues[n] + nextOrigValues[n]) / 2;
    //                     l2rad.data[8][parseInt(i) + 1].record.reflect.moment_data[n] = interp;
    //                 }
    //             }
    //         }
    //     } catch (e) {}
    // }

    // var values = [];
    // for (var i in l2rad.data[8]) { values.push([...l2rad.data[8][i].record.reflect.moment_data]) }

    // // const values = [ [1, 2, 3], [4, 5, 6], [7, 8, 9] ]
    // var interpolatedValues = [];

    // for (var i in values) {
    //     i = parseInt(i);
    //     var curRow = values[i];
    //     var nextRow = values[i + 1];
    //     interpolatedValues.push(curRow);
    //     if (nextRow != undefined) {
    //         var interpRow = [];
    //         for (var n in curRow) {
    //             var curPixel = curRow[n];
    //             var nextPixel = nextRow[n];
    //             if (curPixel != null && nextPixel != null) {
    //                 interpRow.push((curPixel + nextPixel) / 2);
    //             } else {
    //                 interpRow.push(null);
    //             }
    //         }
    //         interpolatedValues.push(interpRow);
    //     }
    // }
    // l2rad.data[8] = l2rad.data[8].map(num => [num, num]).flat();
    // for (var i in l2rad.data[8]) {
    //     l2rad.data[8][i].record.reflect.moment_data = interpolatedValues[i];
    //     if (interpolatedValues[i] == undefined) {
    //         l2rad.data[8][i].record.reflect.moment_data = interpolatedValues[0];
    //     }
    // }

    return l2rad;
}

function dealiasTest(l2rad) {
    var velocities = [];
    const nyquist = l2rad.data[2][0].record.radial.nyquist_velocity / 100;
    for (var i in l2rad.data[2]) { velocities.push(l2rad.data[2][i].record.velocity.moment_data) }

    for (var i in velocities) {
    //for (var i = 100; i < 120; i++) {
        var scaled_ray = [];
        for (var n in velocities[i]) {
            if (velocities[i][n] != null) {
                // extract ray and scale to phase units
                scaled_ray.push(velocities[i][n] * Math.PI / nyquist);
            } else {
                scaled_ray.push(null);
            }
        }
        var periods = 0;
        var unwrapped_velocities = [...scaled_ray];
        for (var ii = 1; ii < scaled_ray.length; ii++) {
            ii = parseInt(ii);
            if (scaled_ray[ii] != null) {
                var difference = scaled_ray[ii] - scaled_ray[ii - 1];
                if (difference > Math.PI) {
                    periods -= 1;
                } else if (difference < -Math.PI) {
                    periods += 1;
                }
                unwrapped_velocities[ii] = scaled_ray[ii] + 2 * Math.PI * periods;
            }
        }
        // scale back into velocity units and store
        for (var x in unwrapped_velocities) {
            if (unwrapped_velocities[x] != null) {
                unwrapped_velocities[x] = unwrapped_velocities[x] * nyquist / Math.PI;
            }
        }
        velocities[i] = [...unwrapped_velocities];
    }

    // for (var i in velocities) {
    //     for (var n in velocities[i]) {
    //         try {
    //             var leftPixel = velocities[parseInt(i) - 1][n];
    //             var rightPixel = velocities[parseInt(i) + 1][n];
    //             var curPixel = velocities[i][n];
    //             if (Math.abs(curPixel) - Math.abs(leftPixel) > 10) {
    //                 velocities[i][n] = (leftPixel + rightPixel) / 2;
    //             }
    //         } catch (e) {}
    //     }
    // }

    // const average = array => array.reduce((a, b) => a + b) / array.length;
    // var avg = average(unwrapped_velocities[i]);
    // if (Math.abs(avg) > nyquist * 2) {
    //     for (var x in unwrapped_velocities) {
    //         //console.log(avg)
    //         for (var n in velocities[i]) {
    //             //velocities[i][n] = null;
    //             if (avg > 0) {
    //                 velocities[i][n] -= nyquist * 2;
    //             } else if (avg < 0) {
    //                 velocities[i][n] += 100;
    //             }
    //         }
    //     }
    // }

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
    // lng: -97.51734430176083, lat: 35.316678641320166, zoom: 11 // KTLX
    // lng: lng: -97.35454576227136, lat: 27.812346235337856, zoom: 6.5 // KCRP
    // map.on('move', (e) => { console.log(map.getCenter()) })
    // map.on('move', (e) => { console.log(map.getZoom()) })
    map.jumpTo({center: [-97.35454576227136, 27.812346235337856], zoom: 6.5});

    //console.log(dealiased)
    for (var i in velocities) { l2rad.data[2][i].record.velocity.moment_data = velocities[i] }

    return l2rad;
}

function mainL2Loading(thisObj) {
    var l2rad = new Level2Radar(ut.toBuffer(thisObj.result), function(l2rad) {
        console.log(l2rad);

        // l2rad = dealiasTest(l2rad);
        // l2rad = upscaleTest(l2rad);

        l2info(l2rad);

        // l2plot(l2rad, 'REF', 8);
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