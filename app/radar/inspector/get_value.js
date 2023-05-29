const formatValue = require('./format_value');

function readPixels(gl, x, y) {
    var data = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
    return data;
}

// https://stackoverflow.com/a/73854666/18758797
function getValue(e) {
    const canvas = map.getCanvas();
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');

    if (gl) {
        // canvas width and height is what you see on the screen
        const canvasWidth = parseFloat(canvas.style.width, 10);
        const canvasHeight = parseFloat(canvas.style.height, 10);

        var mapCenter = map.project(map.getCenter());
        // e.point.x and y, specifying the horizontal and vertical pixels read from the lower left corner of the screen
        canvasX = mapCenter.x; // e.point.x;
        canvasY = mapCenter.y; // e.point.y;

        // WebGL buffer is larger than canvas, there 
        const bufferX = (gl.drawingBufferWidth / canvasWidth * canvasX).toFixed(0);
        const bufferY = (gl.drawingBufferHeight / canvasHeight * (canvasHeight - canvasY)).toFixed(0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, window.atticData.fb);
        var data = readPixels(gl, bufferX, bufferY);

        const cmin = window.atticData.cmin;
        const cmax = window.atticData.cmax;
        if (cmin != undefined) {
            var value = formatValue(data, cmin, cmax);
            if (value == null) {
                $('#colorPickerText').hide();
            } else {
                $('#colorPickerText').show();
            }
            $('#colorPickerText').text(value);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        var [r, g, b, a] = readPixels(gl, bufferX, bufferY);
        var color = `rgba(${r}, ${g}, ${b}, ${a})`;
        $('#colorPicker').css('background-color', color);
    }
}

module.exports = getValue;