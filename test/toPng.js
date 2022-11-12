const PNG = require('pngjs').PNG;
const chroma = require('chroma-js');
const fs = require('fs');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scale(number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function rgbValToArray(rgbString) {
    return rgbString
            .replace('rgb(', '')
            .replace('rgba(', '')
            .replace(')', '')
            .split(', ')
}
function arrayToRgbVal(colorArr) {
    return `rgb(${colorArr[0]}, ${colorArr[1]}, ${colorArr[2]})`
}
function chromaScaleToRgbString(scaleOutput) {
    return `rgb(${parseInt(scaleOutput._rgb[0])}, ${parseInt(scaleOutput._rgb[1])}, ${parseInt(scaleOutput._rgb[2])})`
}

var colors = [
    'rgb(116, 78, 173)',
    'rgb(147, 141, 117)',
    'rgb(150, 145, 83)',
    'rgb(210, 212, 180)',
    'rgb(204, 207, 180)',
    'rgb(65, 91, 158)',
    'rgb(67, 97, 162)',
    'rgb(106, 208, 225)',
    'rgb(111, 214, 232)',
    'rgb(53, 213, 91)',
    'rgb(17, 213, 24)',
    'rgb(9, 94, 9)',
    'rgb(29, 104, 9)',
    'rgb(234, 210, 4)',
    'rgb(255, 226, 0)',
    'rgb(255, 128, 0)',
    'rgb(255, 0, 0)',
    'rgb(113, 0, 0)',
    'rgb(255, 255, 255)',
    'rgb(255, 146, 255)',
    'rgb(255, 117, 255)',
    'rgb(225, 11, 227)',
    'rgb(178, 0, 255)',
    'rgb(99, 0, 214)',
    'rgb(5, 236, 240)',
    'rgb(1, 32, 32)',
    'rgb(1, 32, 32)',
    'rgb(1, 32, 32)'
]
var values = [
    -30, -20,
    -20, -10,
    -10, 10,
    10, 18,
    18, 22,
    22, 35,
    35, 40,
    40, 50,
    50, 60,
    60, 65,
    65, 70,
    70, 75,
    75, 85,
    85,
    95
]

const width = 1500;
const height = 1;

const cmax = values[values.length - 1];
const cmin = values[0];
const clen = colors.length;

const png = new PNG({
    colorType: 2,
    filterType: 4,
    width: width,
    height: height
});

var colorsArr = [];
for (var i in values) {
    var colArr = rgbValToArray(colors[i]);
    colorsArr.push(colArr)
}
var chromaScale = chroma.scale(colorsArr).domain(values).mode('lab');

for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        //console.log((values[x] - cmin) / (cmax - cmin))
        var scaledVal = scale(x, 0, width - 1, cmin, cmax);
        var colorAtVal = chromaScaleToRgbString(chromaScale(scaledVal));
        var arrayColorAtVal = rgbValToArray(colorAtVal);
        colorLog(scaledVal, colorAtVal)

        png.data[i + 0] = arrayColorAtVal[0]; //getRandomInt(0, 255);
        png.data[i + 1] = arrayColorAtVal[1]; //getRandomInt(0, 255);
        png.data[i + 2] = arrayColorAtVal[2]; //getRandomInt(0, 255);
        png.data[i + 3] = 255;
    }
}

const canvas = document.getElementById('grad');
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

function colorLog(content, color, otherCss) {
    // https://stackoverflow.com/a/13017382
    // console.log('%cHello', 'color: green');
    console.log(`%c${content}`, `color: ${color}; ${otherCss}`);
}
for (var i = 0; i < png.data.length; i = i + 4) {
    var rgb = `rgba(${png.data[i]}, ${png.data[i + 1]}, ${png.data[i + 2]}, ${png.data[i + 3]})`;
    //colorLog(rgb, rgb)
}
//png.pack().pipe(fs.createWriteStream('out.png'));