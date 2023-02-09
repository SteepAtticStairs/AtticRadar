const chroma = require('chroma-js');
const ut = require('../../utils');

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

function getValFromColor(color, product, cb) {
    $.getJSON(`./app/radar/products/${product}.json`, function(data) {
        if ($('#dataDiv').data('colorValStuff') == undefined) {
            var colorsArr = [];
            var completeColorsArr = [];
            for (var i in data.values) {
                var colArr = rgbValToArray(data.colors[i]);
                colorsArr.push(colArr)

                var indexedColArr = [i, colArr[0], colArr[1], colArr[2]];
                // if (indexedColArr.lenth == 4) {
                //     indexedColArr = indexedColArr.pop();
                // }
                //completeColorsArr.push(indexedColArr)
            }

            var scale = chroma.scale(colorsArr).domain(data.values).mode('lab');

            var finalObj = {};
            var n = 0;
            for (var i = data.values[0]; i <= data.values[data.values.length - 1]; i++) {
                var colorAtVal = chromaScaleToRgbString(scale(i));
                //ut.colorLog(i, colorAtVal)
                var val = rgbValToArray(colorAtVal);
                completeColorsArr.push([n, val[0], val[1], val[2]])
                finalObj[colorAtVal] = i;
                n++;
            }
            $('#dataDiv').data('colorValStuff', [completeColorsArr, finalObj]);
            // chromaScaleToRgbString(scale(rgbValToArray(color)))
            // console.log(scale(rgbValToArray(color)))
        } else {
            var dataDivThing = $('#dataDiv').data('colorValStuff');
            var completeColorsArr = dataDivThing[0];
            var finalObj = dataDivThing[1];
        }
        function get_closest_color(colors, [r2, g2, b2]) {
            const [[closest_color_id]] = (
                colors
                    .map(([id, r1, g1, b1]) => (
                        [id, Math.sqrt((r2 - r1) ** 2 + (g2 - g1) ** 2 + (b2 - b1) ** 2)]
                    ))
                    .sort(([, d1], [, d2]) => d1 - d2)
            );
            return colors.find(([id]) => id == closest_color_id);
        }

        const closest_color = get_closest_color(completeColorsArr, rgbValToArray(color));

        cb(finalObj[arrayToRgbVal([closest_color[1], closest_color[2], closest_color[3]])])
    })
}

// getValFromColor('rgb(255, 208, 255)', 'N0B', function(val) {
//     console.log(val)
// })

module.exports = getValFromColor;