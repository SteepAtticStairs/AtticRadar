function create_circle_with_text(text, circle_color, text_color, width_height, font_size_scale) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width_height;
    canvas.height = width_height;

    // Get the 2D rendering context
    const ctx = canvas.getContext('2d');

    // Clear the entire canvas to make the background transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set circle properties
    const radius = Math.min(canvas.width, canvas.height) / 2;
    const center_x = canvas.width / 2;
    const center_y = canvas.height / 2;

    // Draw the circle
    ctx.beginPath();
    ctx.arc(center_x, center_y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = circle_color;
    ctx.fill();

    // Set text properties
    const number = text; // Replace with your desired number
    const font_size = radius * font_size_scale; // Adjust the proportion as needed
    const font_family_from_css = getComputedStyle(document.body).fontFamily;
    ctx.font = `bold ${font_size}px ${font_family_from_css}`;
    ctx.fillStyle = text_color;
    ctx.textAlign = 'center';

    // Calculate the corrected vertical position for the text
    const metrics = ctx.measureText(number);
    const text_width = metrics.width;
    const text_height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const text_x = center_x;
    const text_y = center_y + (text_height / 2);

    // Draw the number in the center
    ctx.fillText(number, text_x, text_y);

    // Return the canvas as PNG data
    return canvas.toDataURL('image/png');
}

module.exports = create_circle_with_text;