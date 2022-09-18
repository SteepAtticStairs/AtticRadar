const ut = require('../utils');

// https://stackoverflow.com/a/24253254
function getColorGradientValue(p, rgb_beginning, rgb_end){
    var w = p * 2 - 1;

    var w1 = (w + 1) / 2.0;
    var w2 = 1 - w1;

    var rgb = {
        r: parseInt(rgb_beginning[0] * w1 + rgb_end[0] * w2),
        g: parseInt(rgb_beginning[1] * w1 + rgb_end[1] * w2),
        b: parseInt(rgb_beginning[2] * w1 + rgb_end[2] * w2)
    };
    return rgb;
};

function rgbValToArray(rgbString) {
    return rgbString.replace('rgb(', '').replace(')', '').split(', ')
}

function returnFullColorArray() {
    const tempColorObj = {
        'low': 'rgb(247, 198, 251)',
        '30': 'rgb(204, 120, 214)',
        '40': 'rgb(137, 67, 177)',
        '50': 'rgb(55, 30, 149)',
        '60': 'rgb(78, 167, 222)',
        '70': 'rgb(99, 214, 148)',
        '80': 'rgb(114, 197, 60)',
        '90': 'rgb(251, 251, 86)',
        '100': 'rgb(236, 135, 51)',
        '110': 'rgb(192, 56, 30)',
        'high': 'rgb(146, 32, 19)'
    }
    var allKeys = Object.keys(tempColorObj);
    const minTemp = parseInt(allKeys[0]);
    const maxTemp = parseInt(allKeys[allKeys.length - 3]);

    var allTempColorVals = {};

    for (var i = minTemp; i <= maxTemp; i++) {
        if (i % 10 != 0) {
            var lowestTen = parseInt(i / 10, 10) * 10;
            var highestTen = (parseInt(i / 10, 10) + 1) * 10;

            var lastDigit = i % 10;
            var reversedVal = 10 - lastDigit;
            reversedVal = parseFloat(`0.${reversedVal}`);
            //console.log([lowestTen, i, highestTen])

            var startColor = rgbValToArray(tempColorObj[lowestTen]);
            var endColor = rgbValToArray(tempColorObj[highestTen]);

            var { r, g, b } = getColorGradientValue(reversedVal, startColor, endColor);
            var stringifiedRGB = `rgb(${r}, ${g}, ${b})`;

            allTempColorVals[i] = stringifiedRGB;
            //ut.colorLog(i, stringifiedRGB);
        } else {
            var curRGBVal = tempColorObj[i];
            allTempColorVals[i] = curRGBVal;
            //ut.colorLog(i, curRGBVal);
        }
    }
    return {
        'fullObj': allTempColorVals,
        'minTemp': minTemp,
        'maxTemp': maxTemp,
        'lowTempColor': tempColorObj.low,
        'highTempColor': tempColorObj.high,
    };
}

function getTempColor(tempVal) {
    tempVal = parseInt(tempVal);
    var allColors = returnFullColorArray();

    if (tempVal < allColors.minTemp) {
        return allColors.lowTempColor;
    } else if (tempVal > allColors.maxTemp) {
        return allColors.highTempColor;
    } else {
        return allColors.fullObj[tempVal];
    }
}

module.exports = getTempColor;