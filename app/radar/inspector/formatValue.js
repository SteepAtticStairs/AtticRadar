const ut = require('../utils');

function formatValue(color, cmin, cmax) {
    const product = window.atticData.product;

    // decode the rgb data
    var scaled = color[0] / Math.pow(255, 1) + color[1] / Math.pow(255, 2) + color[2] / Math.pow(255, 3);
    // if it isn't 255 alpha (opaque), there is no radar data to read
    if (color[3] == 255) {
        var value = scaled * (cmax - cmin) + cmin;

        if (
        product == 'REF' || product == 'N0B' || product == 'NXQ' || // reflectivity
        product == 'SW ' || product == 'NSW' // spectrum width
        ) {
            // round to the nearest 0.5
            value = Math.round(value * 2) / 2;
        } else if (
        product == 'N0G' || product == 'N0U' || product == 'TVX' || product == 'VEL' // velocity
        ) {
            // round to the nearest 0.1
            // level 2 & 3 velocity values are provided by default in m/s
            value = parseFloat(value.toFixed(1));
        } else if (
        product == 'N0X' || product == 'ZDR' || // differential reflectivity
        product == 'DVL' // vertically integrated liquid
        ) {
            value = parseFloat(value.toFixed(2));
        } else if (
        product == 'N0C' || product == 'RHO' || // correlation coefficient
        product == 'PHI' // differential phase shift
        ) {
            // round to the nearest 16th
            value = parseFloat(value.toFixed(3));
        } else if (
        product == 'N0H' || product == 'HHC' // hydrometer classification || hybrid hydrometer classification
        ) {
            var hycValues = {
                0: 'Below Threshold', // ND
                10: 'Biological', // BI
                20: 'Ground Clutter', // GC
                30: 'Ice Crystals', // IC
                40: 'Dry Snow', // DS
                50: 'Wet Snow', // WS
                60: 'Light-Mod. Rain', // RA
                70: 'Heavy Rain', // HR
                80: 'Big Drops', // BD
                90: 'Graupel', // GR
                100: 'Hail / Rain', // HA
                110: 'Large Hail', // LH
                120: 'Giant Hail', // GH,
                130: '130', // ??
                140: 'Unknown', // UK
                150: 'Range Folded' // RF
            }
            value = hycValues[Math.round(value)];
        }

        // we don't need to add units to hydrometer classification
        if (product != 'N0H' && product != 'HHC') {
            value = `${value} ${ut.productUnits[product]}`;
        }

        return value;
    } else {
        return '';
    }
}

module.exports = formatValue;