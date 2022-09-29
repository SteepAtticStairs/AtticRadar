// https://stackoverflow.com/a/73854666/18758797
function getMouseColor(e, map) {
    const canvas = map.getCanvas();
    const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");

    if (gl) {
        const data = new Uint8Array(4);

        // Canvas width and hwight is what you see on the screen
        const canvasWidth = parseFloat(canvas.style.width, 10);
        const canvasHeight = parseFloat(canvas.style.height, 10);

        // e.point.x and y, specifying the horizontal and vertical pixels read from the lower left corner of the screen
        canvasX = e.point.x;
        canvasY = e.point.y;

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
        const color = `rgba(${r}, ${g}, ${b}, ${a})`;
        //colorStyle.backgroundColor = color;

        console.log(`%c${color}`, `color: ${color}`);
    }
}

module.exports = getMouseColor;