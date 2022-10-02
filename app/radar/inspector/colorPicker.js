var map = require('../map/map');
const createOffCanvasItem = require('../menu/createOffCanvasItem');
const getValFromColor = require('./getGradientValue');
const ut = require('../utils');

// https://stackoverflow.com/a/73854666/18758797
function getMouseColor(e) {
    const canvas = map.getCanvas();
    const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");

    if (gl) {
        const data = new Uint8Array(4);

        // Canvas width and hwight is what you see on the screen
        const canvasWidth = parseFloat(canvas.style.width, 10);
        const canvasHeight = parseFloat(canvas.style.height, 10);

        var mapCenter = map.project(map.getCenter());
        // e.point.x and y, specifying the horizontal and vertical pixels read from the lower left corner of the screen
        canvasX = mapCenter.x; // e.point.x;
        canvasY = mapCenter.y; // e.point.y;

        // WenGL buffer is larger than canvas, there 
        const bufferX = (gl.drawingBufferWidth / canvasWidth * canvasX).toFixed(0);
        const bufferY = (gl.drawingBufferHeight / canvasHeight * (canvasHeight - canvasY)).toFixed(0);

        gl.readPixels(
            bufferX,
            bufferY,
            1,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            data
        );
        const [r, g, b, a] = data;
        const color = `rgb(${r}, ${g}, ${b})`;
        //colorStyle.backgroundColor = color;

        getValFromColor(color, 'N0B', function(val) {
            //console.log(val)
            $('#colorPickerText').text(val);
            //ut.colorLog(val, val)
        })
        //console.log(`%c${color}`, `color: ${color}`);
        $('#colorPicker').css('background-color', color);
    }
}

createOffCanvasItem({
    'id': 'colorPickerMenuItem',
    'class': 'alert alert-secondary offCanvasMenuItem',
    'contents': 'Color Picker',
    'icon': 'fa fa-binoculars', // fa-binoculars, fa-microscope, fa-magnifying-glass
    'css': ''
}, function(thisObj, innerDiv, iconElem) {
    if (!$(thisObj).hasClass('alert-primary')) {
        $(thisObj).addClass('alert-primary');
        $(thisObj).removeClass('alert-secondary');

        map.on("move", getMouseColor);
        $('.colorPicker').show();
    } else if ($(thisObj).hasClass('alert-primary')) {
        $(thisObj).removeClass('alert-primary');
        $(thisObj).addClass('alert-secondary');

        $('.colorPicker').hide();
        map.off("move", getMouseColor);
    }
})

module.exports = getMouseColor;