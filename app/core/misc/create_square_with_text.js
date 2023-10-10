// function create_circle_with_text(text, circle_color, text_color, width_height, font_size_scale) {
//     // Create a canvas element
//     const canvas = document.createElement('canvas');
//     canvas.width = width_height;
//     canvas.height = width_height;

//     // Get the 2D rendering context
//     const ctx = canvas.getContext('2d');

//     // Clear the entire canvas to make the background transparent
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Set circle properties
//     const radius = Math.min(canvas.width, canvas.height) / 2;
//     const center_x = canvas.width / 2;
//     const center_y = canvas.height / 2;

//     // Draw the circle
//     ctx.beginPath();
//     ctx.arc(center_x, center_y, radius, 0, 2 * Math.PI);
//     ctx.fillStyle = circle_color;
//     ctx.fill();

//     // Set text properties
//     const number = text; // Replace with your desired number
//     const font_size = radius * font_size_scale; // Adjust the proportion as needed
//     const font_family_from_css = getComputedStyle(document.body).fontFamily;
//     ctx.font = `bold ${font_size}px ${font_family_from_css}`;
//     ctx.fillStyle = text_color;
//     ctx.textAlign = 'center';

//     // Calculate the corrected vertical position for the text
//     const metrics = ctx.measureText(number);
//     const text_width = metrics.width;
//     const text_height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
//     const text_x = center_x;
//     const text_y = center_y + (text_height / 2);

//     // Draw the number in the center
//     ctx.fillText(number, text_x, text_y);

//     // Return the canvas as PNG data
//     return canvas.toDataURL('image/png');
// }

function _get_font_metrics(text, width_height, font_size_scale, font_family_from_css) {
    const canvas = document.createElement('canvas');
    canvas.width = width_height;
    canvas.height = width_height;

    // Get the 2D rendering context
    const ctx = canvas.getContext('2d');

    // Set circle properties
    const radius = Math.min(canvas.width, canvas.height) / 2;
    const center_x = canvas.width / 2;
    const center_y = canvas.height / 2;

    // Set text properties
    const number = text; // Replace with your desired number
    const font_size = radius * font_size_scale; // Adjust the proportion as needed
    ctx.font = `bold ${font_size}px ${font_family_from_css}`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';

    // Calculate the corrected vertical position for the text
    const metrics = ctx.measureText(number);
    const text_width = metrics.width;
    const text_height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const text_x = center_x;
    const text_y = center_y + (text_height / 2);

    return [text_x, text_y];
}

function create_square_with_text(text, square_color, text_color, width_height, font_size_scale, return_encoded = true) {
    const border_radius = 50;

    // Get the font family from the CSS
    const font_family_from_css = getComputedStyle(document.body).fontFamily;

    // Create an SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', width_height);
    svg.setAttribute('height', width_height);

    // Create the square element with rounded corners
    const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    square.setAttribute('x', 0);
    square.setAttribute('y', 0);
    square.setAttribute('width', width_height);
    square.setAttribute('height', width_height);
    square.setAttribute('rx', border_radius); // Set the border radius (rounded corners)
    square.setAttribute('ry', border_radius); // Set the border radius (rounded corners)
    square.setAttribute('fill', square_color);

    const [text_x, text_y] = _get_font_metrics(text, width_height, font_size_scale, font_family_from_css);

    // Create the text element
    const text_element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text_element.setAttribute('x', text_x);
    text_element.setAttribute('y', text_y);
    text_element.setAttribute('fill', text_color);
    text_element.setAttribute('font-size', width_height * (font_size_scale / 2));
    text_element.setAttribute('text-anchor', 'middle');
    text_element.setAttribute('font-family', font_family_from_css);
    text_element.setAttribute('font-weight', 'bold');
    text_element.textContent = text;

    // Append the square and text elements to the SVG
    svg.appendChild(square);
    svg.appendChild(text_element);

    // Return the SVG data
    const svg_data = new XMLSerializer().serializeToString(svg);
    if (return_encoded) {
        return 'data:image/svg+xml,' + encodeURIComponent(svg_data);
    } else {
        return svg_data;
    }
}

module.exports = create_square_with_text;