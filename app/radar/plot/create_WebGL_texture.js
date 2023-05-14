const ut = require('../../core/utils');
const PNG = require('pngjs').PNG;
const chroma = require('chroma-js');

function rgbValToArray(rgbString) {
    return rgbString
        .replace('rgb(', '')
        .replace('rgba(', '')
        .replace(')', '')
        .split(', ')
}
function chromaScaleToRgbString(scaleOutput) {
    return `rgb(${parseInt(scaleOutput._rgb[0])}, ${parseInt(scaleOutput._rgb[1])}, ${parseInt(scaleOutput._rgb[2])})`
}

function create_WebGL_texture(colors, values) {
    const width = 1500;
    const height = 1;
    const cmin = values[0];
    const cmax = values[values.length - 1];

    const png = new PNG({
        colorType: 2,
        filterType: 4,
        width: width,
        height: height
    });

    var colorsArray = [];
    for (var i in values) {
        var colArr = rgbValToArray(colors[i]);
        colorsArray.push(colArr)
    }
    var chromaScale = chroma.scale(colors).domain(values).mode('lab');

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;

            //console.log((values[x] - cmin) / (cmax - cmin))
            var scaledVal = ut.scale(x, 0, width - 1, cmin, cmax);
            var colorAtVal = chromaScaleToRgbString(chromaScale(scaledVal));
            var arrayColorAtVal = rgbValToArray(colorAtVal);

            png.data[i + 0] = arrayColorAtVal[0]; //getRandomInt(0, 255);
            png.data[i + 1] = arrayColorAtVal[1]; //getRandomInt(0, 255);
            png.data[i + 2] = arrayColorAtVal[2]; //getRandomInt(0, 255);
            png.data[i + 3] = 255;
        }
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.canvas.width = png.width;
    ctx.canvas.height = png.height;

    // https://stackoverflow.com/a/16404317
    var imgData = ctx.createImageData(png.width, png.height);

    var ubuf = new Uint8Array(png.data);
    for (var i = 0; i < ubuf.length; i += 4) {
        imgData.data[i] = ubuf[i];   // red
        imgData.data[i + 1] = ubuf[i + 1]; // green
        imgData.data[i + 2] = ubuf[i + 2]; // blue
        imgData.data[i + 3] = ubuf[i + 3]; // alpha
    }

    // for (var i = 0; i < imgData.data.length; i = i + 4) {
    //     var rgb = `rgba(${imgData.data[i]}, ${imgData.data[i + 1]}, ${imgData.data[i + 2]}, ${imgData.data[i + 3]})`;
    //     //ut.colorLog(rgb, rgb)
    // }

    return imgData;
}

module.exports = create_WebGL_texture;