const ut = require('../utils');

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

function createAndShowColorbar(colors, values) {
    if ($('#mapColorScale').is(":hidden")) {
        ut.setMapMargin('bottom', '+=15px');
    }
    var offset;
    if (require('../misc/detectmobilebrowser')) {
        offset = $(window).height() * (5 / 100);
    } else {
        offset = 0;
    }
    $('#mapColorScale').css({
        'bottom': offset + $('#mapFooter').height(),
        'height': '15px'
    }).show();
    $('#productMapFooter').css('bottom', 0 + $('#mapFooter').height() + $('#mapColorScale').height());

    var actualCanvas = document.getElementById('texturecolorbar');
    var visualCanvas = document.getElementById('mapColorScale');

    var width = 1500;
    var height = 1;

    actualCanvas.width = width;
    actualCanvas.height = height;
    visualCanvas.width = $('#mapColorScale').width();
    visualCanvas.height = $('#mapColorScale').height();

    var actualCTX = actualCanvas.getContext('2d');
    var visualCTX = visualCanvas.getContext('2d');

    actualCTX.clearRect(0, 0, actualCanvas.width, actualCanvas.height);
    visualCTX.clearRect(0, 0, visualCanvas.width, visualCanvas.height);

    var actualGradient = actualCTX.createLinearGradient(0, 0, actualCanvas.width, 0);
    var visualGradient = visualCTX.createLinearGradient(0, 0, visualCanvas.width, 0);

    var cmax = values[values.length - 1];
    var cmin = values[0];
    var clen = colors.length;

    var gradColors = '';
    for (var i = 0; i < clen; ++i) {
        actualGradient.addColorStop((values[i] - cmin) / (cmax - cmin), colors[i]);
        visualGradient.addColorStop((values[i] - cmin) / (cmax - cmin), colors[i]);

        var curPercent = (((values[i] - cmin) / (cmax - cmin)) * 100);
        gradColors += `${colors[i]} ${curPercent}%`;
        if (!(i == clen - 1)) { gradColors += ',\n' }
    }
    actualCTX.fillStyle = actualGradient;
    //visualCTX.fillStyle = visualGradient;

    actualCTX.fillRect(0, 0, actualCanvas.width, actualCanvas.height);
    //visualCTX.fillRect(0, 0, visualCanvas.width, visualCanvas.height);

    $('<style>')
        .prop('type', 'text/css')
        .html(`
        #mapColorScale {
            background: linear-gradient(
                to right,
                ${gradColors}
            );
        }`)
        .appendTo('head');

    // const png = new PNG({
    //     colorType: 2,
    //     filterType: 4,
    //     width: width,
    //     height: height
    // });

    // var colorsArr = [];
    // for (var i in values) {
    //     var colArr = rgbValToArray(colors[i]);
    //     colorsArr.push(colArr)
    // }
    // var chromaScale = chroma.scale(colors).domain(values).mode('lab');

    // for (let y = 0; y < height; y++) {
    //     for (let x = 0; x < width; x++) {
    //         const i = (y * width + x) * 4;

    //         //console.log((values[x] - cmin) / (cmax - cmin))
    //         var scaledVal = ut.scale(x, 0, width - 1, cmin, cmax);
    //         var colorAtVal = chromaScaleToRgbString(chromaScale(scaledVal));
    //         var arrayColorAtVal = rgbValToArray(colorAtVal);

    //         png.data[i + 0] = arrayColorAtVal[0]; //getRandomInt(0, 255);
    //         png.data[i + 1] = arrayColorAtVal[1]; //getRandomInt(0, 255);
    //         png.data[i + 2] = arrayColorAtVal[2]; //getRandomInt(0, 255);
    //         png.data[i + 3] = 255;
    //     }
    // }

    // const canvas = document.createElement('canvas');
    // const ctx = canvas.getContext('2d');
    // ctx.canvas.width = png.width;
    // ctx.canvas.height = png.height;

    // // https://stackoverflow.com/a/16404317
    // var imgData = ctx.createImageData(png.width, png.height);

    // var ubuf = new Uint8Array(png.data);
    // for (var i = 0; i < ubuf.length; i += 4) {
    //     imgData.data[i] = ubuf[i];   // red
    //     imgData.data[i + 1] = ubuf[i + 1]; // green
    //     imgData.data[i + 2] = ubuf[i + 2]; // blue
    //     imgData.data[i + 3] = ubuf[i + 3]; // alpha
    // }

    // for (var i = 0; i < imgData.data.length; i = i + 4) {
    //     var rgb = `rgba(${imgData.data[i]}, ${imgData.data[i + 1]}, ${imgData.data[i + 2]}, ${imgData.data[i + 3]})`;
    //     //ut.colorLog(rgb, rgb)
    // }

    // imagedata = imgData;
    // imagetexture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, imagetexture);
    // pageState.imagedata = imagedata;
    // pageState.imagetexture = imagetexture;

    // $('#texturecolorbar').clone().appendTo('#mapColorScaleContainer').attr('id', 'mapColorScale');
    // $('#mapColorScale').removeClass('texturecolorbar');
    // $('#mapColorScale').css({
    //     'position': 'absolute',
    //     'z-index': 115,
    //     'bottom': '50px',
    //     'height': '10px',
    //     'width': '100%',
    //     'display': 'block'
    // })
    // // position: absolute;
    // // z-index: 115;
    // // bottom: 50px;
    // // height: 10px;
    // // width: 100%;
    // console.log($('#mapColorScale'))
    //tt.initPaletteTooltip(produc, colortcanvas);
}

module.exports = createAndShowColorbar;