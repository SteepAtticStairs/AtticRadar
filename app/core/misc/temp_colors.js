const ut = require('../utils');
const chroma = require('chroma-js');

const low_temp = 'rgb(247, 198, 251)';
const high_temp = 'rgb(163, 8, 148)';
const temp_colors_dictionary = {
    '0': low_temp,
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
    '120': high_temp
}
const temperatures = Object.keys(temp_colors_dictionary).map(Number);
const colors = Object.values(temp_colors_dictionary);

const min_temp = Math.min(...temperatures);
const max_temp = Math.max(...temperatures);

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