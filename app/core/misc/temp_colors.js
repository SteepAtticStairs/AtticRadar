const ut = require('../utils');
const chroma = require('chroma-js');

// https://github.com/cambecc/earth/blob/5f091f0c3b60aa38a996a886985bacb3673d16c3/public/libs/earth/1.0.0/products.js#L178
const temp_colors_dictionary = {
    '-112.27': 'rgb(37, 4, 42)', // 193 K
    '-88.87': 'rgb(41, 10, 130)', // 206 K
    '-65.47': 'rgb(81, 40, 40)', // 219 K
    '-40': 'rgb(192, 37, 149)', // 233.15 K, -40 C/F
    '0': 'rgb(70, 215, 215)', // 255.372 K, 0 F
    '32': 'rgb(21, 84, 187)', // 273.15 K, 0 C
    '35.6': 'rgb(24, 132, 14)', // 275.15 K, just above 0 C
    '64.13': 'rgb(247, 251, 59)', // 291 K
    '76.73': 'rgb(235, 167, 21)', // 298 K
    '100.13': 'rgb(230, 71, 39)', // 311 K
    '130.73': 'rgb(88, 27, 67)' // 328 K
}

const temperatures = Object.keys(temp_colors_dictionary).map(Number);
const colors = Object.values(temp_colors_dictionary);

const min_temp = Math.min(...temperatures);
const max_temp = Math.max(...temperatures);

const low_temp = temp_colors_dictionary[min_temp];
const high_temp = temp_colors_dictionary[max_temp];

const chroma_scale = chroma.scale(colors).domain(temperatures).mode('lab');

function _determine_contrast(color) {
    // this should actually be 0.4, i believe
    return chroma(color).luminance() > 0.3 ? 'black' : 'white';
}

function getTempColor(temp_val) {
    temp_val = parseInt(temp_val);

    var color;
    if (temp_val < min_temp) {
        color = low_temp;
    } else if (temp_val > max_temp) {
        color = high_temp;
    } else {
        color = chroma_scale(temp_val);
    }

    const contrast_color = _determine_contrast(color);

    return [color, contrast_color];
    // return {
    //     'background_color': color,
    //     'text_color': _determine_contrast(color)
    // }
}

module.exports = getTempColor;