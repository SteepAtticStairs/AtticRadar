const { Level2Radar } = require('../../../lib/nexrad-level-2-data/src');
const { plot } = require('../../../lib/nexrad-level-2-plot/src');
//const l2listeners = require('./archive/eventListeners').loadL2Listeners;
const l2info = require('./l2info');
const l2plot = require('./l2plot');

const dealias = require('./dealias/dealias');

//const loadL2Menu = require('./archive/loadL2Menu');
const loadL2Menu = require('./l2menu');

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

function mainL2Loading(thisObj) {
    var l2rad = new Level2Radar(ut.toBuffer(thisObj.result), function(l2rad) {
        console.log(l2rad);

        // l2rad = upscaleTest(l2rad);
        // const dealiasHelper = require('./dealias/dealiasHelper');
        // l2rad = dealiasHelper.dealiasRadarObject(l2rad, 2);
        // window.atticData.shouldPlotDealiased = true;

        // display some file data on the info divs
        l2info(l2rad);
        // plot the data
        l2plot(l2rad, 'REF', 1);
        // load the elevation selection menu
        loadL2Menu(l2rad.listElevationsAndProducts(), l2rad);
    });
}

module.exports = mainL2Loading;