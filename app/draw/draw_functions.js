const map = require('../core/map/map');

// https://stackoverflow.com/a/30684711/18758797
function enable_drawing() {
    // create canvas element and append it to document body
    var canvas = document.createElement('canvas');
    canvas.id = 'draw_canvas';
    document.body.appendChild(canvas);
    canvas.style = map.getCanvas().style;

    // some hotfixes... ( ≖_≖)
    document.body.style.margin = 0;
    canvas.style.position = 'fixed';

    // get canvas 2D context and set it to the correct size
    var ctx = canvas.getContext('2d');
    resize();

    // last known position
    var pos = { x: 0, y: 0 };

    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', draw);
    document.addEventListener('mousedown', setPosition);
    document.addEventListener('mouseenter', setPosition);

    // Touch events
    canvas.addEventListener('touchstart', setPosition);
    canvas.addEventListener('touchmove', drawTouch);
    canvas.addEventListener('touchend', stopDrawing);

    // new position from mouse event
    function setPosition(e) {
        e.preventDefault(); // Prevent the default touch behavior

        if (e.touches) {
            // If it's a touch event, use the first touch point
            pos.x = e.touches[0].clientX;
            pos.y = e.touches[0].clientY;
        } else {
            pos.x = e.clientX;
            pos.y = e.clientY;
        }
    }

    // resize canvas
    function resize() {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
    }

    function draw(e) {
        // mouse left button must be pressed
        if (e.buttons !== 1) return;

        ctx.beginPath(); // begin

        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgb(92, 157, 255)';

        ctx.moveTo(pos.x, pos.y); // from
        setPosition(e);
        ctx.lineTo(pos.x, pos.y); // to

        ctx.stroke(); // draw it!
    }

    // Touch event drawing functions
    var isDrawing = false;

    function drawTouch(e) {
        if (!isDrawing) return;

        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgb(92, 157, 255)';

        ctx.lineTo(pos.x, pos.y); // to
        setPosition(e);
        ctx.stroke(); // draw it!
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Start drawing on touch
    canvas.addEventListener('touchstart', function (e) {
        isDrawing = true;
        setPosition(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    });
}

function disable_drawing() {
    $('#draw_canvas').off().remove();
}

module.exports = {
    enable_drawing,
    disable_drawing
}