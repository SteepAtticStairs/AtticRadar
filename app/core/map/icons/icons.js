const map = require("../map");

function _load_image(image_data) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = image_data;
        img.onload = () => {
            resolve(img);
        }
    });
}

function _add_image_to_map(image_data, image_name, callback) {
    _load_image(image_data)
        .then((image) => {
            if (!map.hasImage(image_name)) {
                map.addImage(image_name, image);
            }
            callback();
        })
        .catch((error) => {
            throw error;
        });
}

function add_icon_svg(icons_array, callback, i = 0) {
    const svg_string = icons_array[i][0];
    const icon_name = icons_array[i][1];

    const html_element = new DOMParser().parseFromString(svg_string, 'image/svg+xml');
    const serialized_string = new XMLSerializer().serializeToString(html_element);
    const base64_svg = `data:image/svg+xml,${encodeURIComponent(serialized_string)}`;

    _add_image_to_map(base64_svg, icon_name, () => {
        if (i < icons_array.length - 1) {
            add_icon_svg(icons_array, callback, i + 1);
        } else {
            callback();
        }
    });
}

const icons = {
    grey_station_marker: 
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
        <!-- Simple rectangle with blue fill -->
        <rect width="200" height="100" rx="20" fill="#969696" />
    </svg>`,

    blue_station_marker: 
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
        <!-- Simple rectangle with blue fill -->
        <rect width="200" height="100" rx="20" fill="#009dff" />
    </svg>`,

    red_station_marker: 
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
        <!-- Simple rectangle with blue fill -->
        <rect width="200" height="100" rx="20" fill="#ff4e4e" />
    </svg>`,

    orange_station_marker: 
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
        <!-- Simple rectangle with blue fill -->
        <rect width="200" height="100" rx="20" fill="#b0801a" />
    </svg>`,

    dark_grey_station_marker: 
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
        <!-- Simple rectangle with blue fill -->
        <rect width="200" height="100" rx="20" fill="#696969" />
    </svg>`,

    tornado_icon: 
    `<?xml version="1.0" encoding="utf-8"?>
    <svg height="100.5" width="100.5" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="42" style="fill: rgb(0, 0, 0);" />
        <circle cx="50" cy="50" r="40" style="fill: rgb(255, 255, 255);" />
        <g transform="matrix(1, 0, 0, 1, -420.083984, -413.912628)">
            <g style="" transform="matrix(0.051285, 0, 0, 0.051285, 423.798828, 432.259979)">
                <path
                    d="M 1322.403 275.916 C 1288.603 229.916 1150.903 180.916 939.503 180.916 C 728.203 180.916 590.503 223.816 556.703 275.916 C 495.503 376.916 734.403 453.516 651.703 530.016 C 489.503 677.016 541.503 827.016 590.503 876.016 C 654.903 940.416 716.003 980.116 878.403 1035.316 C 973.203 1065.916 973.203 1160.916 973.203 1160.916 C 973.203 1160.916 1120.203 1020.016 844.603 906.816 C 731.403 860.816 872.103 741.416 1068.103 621.916 C 1294.903 481.016 1371.403 337.016 1322.403 275.916 Z"
                    style="" />
            </g>
        </g>
    </svg>`,

    lightning_bolt_regular: 
    `<svg xmlns="http://www.w3.org/2000/svg" width="100px" height="100px" viewBox="0 0 100 100">
        <g id="surface1">
            <path style="stroke:none;fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1"
                d="M 44.761719 28.234375 C 33.066406 43.234375 23.460938 55.585938 23.441406 55.664062 C 23.402344 55.761719 28.5625 55.835938 34.902344 55.835938 C 45.785156 55.835938 46.425781 55.855469 46.328125 56.164062 C 46 57.246094 36.546875 98.863281 36.605469 99 C 36.644531 99.152344 76.558594 39.5625 76.558594 39.328125 C 76.558594 39.273438 72.382812 39.214844 67.28125 39.214844 C 58.449219 39.214844 58.003906 39.195312 58.003906 38.867188 C 58.003906 38.671875 59.820312 30.089844 62.042969 19.769531 C 64.265625 9.464844 66.0625 1.019531 66.042969 1 C 66.042969 0.980469 56.457031 13.253906 44.761719 28.234375 Z M 44.761719 28.234375" />
            <path style="stroke:none;fill-rule:nonzero;fill:rgb(100%,100%,100%);fill-opacity:1"
                d="M 64.398438 4.480469 C 64.421875 4.480469 56.804688 40.203125 56.804688 40.203125 C 56.804688 40.203125 75.0625 40.121094 75.0625 40.195312 C 75.0625 40.386719 38.902344 94.019531 38.828125 93.949219 C 38.777344 93.925781 47.652344 54.996094 47.652344 54.996094 L 25.179688 54.996094 C 25.179688 54.996094 64.371094 4.457031 64.398438 4.480469 Z M 64.398438 4.480469" />
        </g>
    </svg>`,

    lightning_bolt_bold: 
    `<svg width="100px" height="100px" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs></defs>
        <g id="surface1">
            <path style="stroke:none;fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1"
                d="M 44.761719 28.234375 C 33.066406 43.234375 23.460938 55.585938 23.441406 55.664062 C 23.402344 55.761719 28.5625 55.835938 34.902344 55.835938 C 45.785156 55.835938 46.425781 55.855469 46.328125 56.164062 C 46 57.246094 36.546875 98.863281 36.605469 99 C 36.644531 99.152344 76.558594 39.5625 76.558594 39.328125 C 76.558594 39.273438 72.382812 39.214844 67.28125 39.214844 C 58.449219 39.214844 58.003906 39.195312 58.003906 38.867188 C 58.003906 38.671875 59.820312 30.089844 62.042969 19.769531 C 64.265625 9.464844 66.0625 1.019531 66.042969 1 C 66.042969 0.980469 56.457031 13.253906 44.761719 28.234375 Z M 56.089844 29.550781 L 53.246094 42.789062 L 61.425781 42.847656 C 65.929688 42.867188 69.601562 42.945312 69.601562 43.003906 C 69.601562 43.15625 44.800781 80.191406 44.742188 80.136719 C 44.703125 80.117188 46.054688 74.085938 47.738281 66.757812 C 49.421875 59.414062 50.871094 53.132812 50.945312 52.804688 L 51.082031 52.164062 L 41.011719 52.125 L 30.960938 52.066406 L 44.914062 34.167969 C 52.589844 24.3125 58.890625 16.269531 58.910156 16.289062 C 58.929688 16.289062 57.65625 22.261719 56.089844 29.550781 Z M 56.089844 29.550781">
            </path>
        </g>
        <g id="g-1" style="" transform="matrix(0.810689, 0, 0, 0.780673, 28.218863, 20.208618)">
            <path style="stroke: none; fill-rule: nonzero; fill-opacity: 1; fill: rgb(255, 255, 255);"
                d="M 56.089844 29.550781"></path>
            <path style="stroke: none; fill-rule: nonzero; fill-opacity: 1; fill: rgb(255, 255, 255);"
                d="M 41.079 -11.713 C 41.106 -11.713 32.185 28.283 32.185 28.283 L 43.104 28.364 C 49.116 28.391 52.832 28.498 52.832 28.58 C 52.832 28.791 17.648 83.747 17.571 83.672 C 17.519 83.643 26.958 41.284 26.958 41.284 L 15.854 41.206 L 2.436 41.126 C 2.436 41.126 41.052 -11.741 41.079 -11.713 Z">
            </path>
        </g>
    </svg>`,

    blue_triangle: 
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <polygon points="0,100 50,0 100,100" style="fill: rgb(0, 100, 245);" />
    </svg>`,

    purple_triangle: 
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <polygon points="0,100 50,0 100,100" style="fill: rgb(95, 54, 196);" />
    </svg>`,

    purple_semicircle: 
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path d="M0,100 A50,50 0 0,1 100,100 H0 Z" style="fill: rgb(95, 54, 196);" />
    </svg>`,

    red_semicircle: 
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path d="M0,100 A50,50 0 0,1 100,100 H0 Z" style="fill: rgb(234, 51, 35);" />
    </svg>`
}

module.exports = {
    icons,
    add_icon_svg
};