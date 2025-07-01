const map = require('../core/map/map');

function enable_drawing() {
    var canvas = new fabric.Canvas('draw_canvas');
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
    canvas.setBackgroundColor('transparent');
    $('body').append(canvas.wrapperEl);

    // Set up drawing properties
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 7;
    canvas.freeDrawingBrush.color = 'rgb(92, 157, 255)';

    window.atticData.fabricjs_canvas = canvas;
}

function disable_drawing() {
    // $('#draw_canvas').off().remove();
    if (window.atticData.fabricjs_canvas != undefined) {
        window.atticData.fabricjs_canvas.dispose();
    }
    // https://stackoverflow.com/a/10463219/18758797
    $('body > canvas').remove();
}

module.exports = {
    enable_drawing,
    disable_drawing
}