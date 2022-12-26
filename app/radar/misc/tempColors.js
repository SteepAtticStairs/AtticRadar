const ut = require('../utils');

const tempColorObj = {
    'low': 'rgb(247, 198, 251)',
    '10': 'rgb(204, 120, 214)',
    '20': 'rgb(137, 67, 177)',
    '30': 'rgb(55, 30, 149)',
    '40': 'rgb(78, 167, 222)',
    '50': 'rgb(99, 214, 148)',
    '60': 'rgb(114, 197, 60)',
    '70': 'rgb(251, 251, 86)',
    '80': 'rgb(236, 135, 51)',
    '90': 'rgb(192, 56, 30)',
    '100': 'rgb(237, 14, 133)',
    '110': 'rgb(237, 14, 215)',
    'high': 'rgb(163, 8, 148)'
}

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

// https://stackoverflow.com/a/5624139
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
// https://stackoverflow.com/a/11868159
function colorLightOrDark(R, G, B) {
    // https://stackoverflow.com/a/4726403
    // var nThreshold = 105;
    // var bgDelta = (R * 0.299) + (G * 0.587) + (B * 0.114);
    // return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff"; 

    // http://www.w3.org/TR/AERT#color-contrast
    const brightness = Math.round((
        (parseInt(R) * 299) +
        (parseInt(G) * 587) +
        (parseInt(B) * 114)) / 1000);
    const textColour = (brightness > 125) ? 'black' : 'white';
    return textColour;
}

function returnFullColorArray() {
    var allKeys = Object.keys(tempColorObj);
    allKeys = allKeys.map(element => Number(element)).filter(number => !Number.isNaN(number));
    const minTemp = Math.min(...allKeys);
    const maxTemp = Math.max(...allKeys);

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
            var lightOrDark = colorLightOrDark(r, g, b);
            var stringifiedRGB = `rgb(${r}, ${g}, ${b})`;

            allTempColorVals[i] = [stringifiedRGB, lightOrDark];
            //ut.colorLog(i, stringifiedRGB);
            //ut.colorLog(`   ${i}   `, lightOrDark, `background-color: ${stringifiedRGB}`);
        } else {
            var curRGBVal = tempColorObj[i];
            var rgbArr = rgbValToArray(curRGBVal);
            var lightOrDark = colorLightOrDark(rgbArr[0], rgbArr[1], rgbArr[2]);
            allTempColorVals[i] = [curRGBVal, lightOrDark];
            //ut.colorLog(i, curRGBVal);
            //ut.colorLog(`   ${i}   `, lightOrDark, `background-color: ${curRGBVal}`);
        }
    }
    var lowTempReturnVal = tempColorObj.low;
    var rgbArr = rgbValToArray(lowTempReturnVal);
    var lightOrDark = colorLightOrDark(rgbArr[0], rgbArr[1], rgbArr[2]);
    lowTempReturnVal = [lowTempReturnVal, lightOrDark];

    var highTempReturnVal = tempColorObj.high;
    var rgbArr = rgbValToArray(highTempReturnVal);
    var lightOrDark = colorLightOrDark(rgbArr[0], rgbArr[1], rgbArr[2]);
    highTempReturnVal = [highTempReturnVal, lightOrDark];

    return {
        'fullObj': allTempColorVals,
        'minTemp': minTemp,
        'maxTemp': maxTemp,
        'lowTempColor': lowTempReturnVal,
        'highTempColor': highTempReturnVal
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

// ut.colorLog(60, getTempColor(60));
// ut.colorLog(70, getTempColor(70));
// ut.colorLog(80, getTempColor(80));
// ut.colorLog(90, getTempColor(90));
// ut.colorLog(100, getTempColor(100));

module.exports = getTempColor;