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

    lightning_bolt_thick_big: 
    `<? xml version="1.0" encoding="utf-8" ?>
    < !--Svg Vector Icons: http://www.onlinewebfonts.com/icon -->
    < !DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">
        <metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata>
        <g><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"><path d="M4476.2,2296.5C3306.8,796.5,2346.1-438.6,2344.2-446.3c-3.9-9.7,512.2-17.4,1146.2-17.4c1088.2,0,1152-2,1142.4-32.9c-32.9-108.2-978.1-4269.8-972.3-4283.4c3.9-15.4,3995.4,5943.8,3995.4,5967c0,5.8-417.5,11.6-927.8,11.6c-883.3,0-927.8,1.9-927.8,34.8c0,19.3,181.7,877.6,404,1909.7c222.3,1030.3,402,1875,400.1,1876.9C6604.4,5021.9,5645.6,3794.5,4476.2,2296.5z M5608.9,2165.1L5324.8,841l817.6-5.8c450.4-1.9,817.6-9.7,817.6-15.5c0-15.5-2480-3719-2485.8-3713.2c-3.9,1.9,131.4,605,299.6,1337.6C4942-821.3,5087-193.1,5094.7-160.3l13.5,63.8l-1007.1,3.9l-1005.1,5.8l1395.6,1789.9C5259,2688.9,5889.2,3493,5891.1,3491C5893,3491,5765.5,2893.8,5608.9,2165.1z" /></g></g>
    </svg>`,

    lightning_bolt_big: 
    `<? xml version="1.0" encoding="utf-8" ?>
    <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
        <g>
            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
                <path d="M 4476.2 2296.5 C 3306.8 796.5 2346.1 -438.6 2344.2 -446.3 C 2340.2999999999997 -456 2856.3999999999996 -463.7 3490.3999999999996 -463.7 C 4578.599999999999 -463.7 4642.4 -465.7 4632.799999999999 -496.59999999999997 C 4599.9 -604.8 3654.6999999999994 -4766.400000000001 3660.499999999999 -4780 C 3664.399999999999 -4795.4 7655.9 1163.8000000000002 7655.9 1187 C 7655.9 1192.8 7238.4 1198.6 6728.099999999999 1198.6 C 5844.799999999999 1198.6 5800.299999999999 1200.5 5800.299999999999 1233.3999999999999 C 5800.299999999999 1252.6999999999998 5981.999999999999 2111 6204.299999999999 3143.1 C 6426.599999999999 4173.4 6606.299999999999 5018.1 6604.4 5020 C 6604.4 5021.9 5645.6 3794.5 4476.2 2296.5 Z" />
                <path d="M 6439.781 4671.825 C 6442.262 4671.825 5680.533 1099.768 5680.533 1099.768 C 5680.533 1099.768 7506.221 1107.764 7506.221 1100.571 C 7506.221 1081.348 3890.304 -4281.962 3882.732 -4274.767 C 3877.641 -4272.412 4765.287 -379.757 4765.287 -379.757 L 2518.079 -379.478 C 2518.079 -379.478 6437.302 4674.305 6439.781 4671.825 Z" style="paint-order: fill; fill: rgb(255, 255, 255);" />
            </g>
        </g>
    </svg>`,

    lightning_bolt: 
    `<? xml version="1.0" encoding="UTF-8" ?>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100px" height="100px" viewBox="0 0 100 100" version="1.1">
        <g id="surface1">
            <path style=" stroke:none;fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;" d="M 44.761719 28.234375 C 33.066406 43.234375 23.460938 55.585938 23.441406 55.664062 C 23.402344 55.761719 28.5625 55.835938 34.902344 55.835938 C 45.785156 55.835938 46.425781 55.855469 46.328125 56.164062 C 46 57.246094 36.546875 98.863281 36.605469 99 C 36.644531 99.152344 76.558594 39.5625 76.558594 39.328125 C 76.558594 39.273438 72.382812 39.214844 67.28125 39.214844 C 58.449219 39.214844 58.003906 39.195312 58.003906 38.867188 C 58.003906 38.671875 59.820312 30.089844 62.042969 19.769531 C 64.265625 9.464844 66.0625 1.019531 66.042969 1 C 66.042969 0.980469 56.457031 13.253906 44.761719 28.234375 Z M 44.761719 28.234375 " />
            <path style=" stroke:none;fill-rule:nonzero;fill:rgb(100%,100%,100%);fill-opacity:1;" d="M 64.398438 4.480469 C 64.421875 4.480469 56.804688 40.203125 56.804688 40.203125 C 56.804688 40.203125 75.0625 40.121094 75.0625 40.195312 C 75.0625 40.386719 38.902344 94.019531 38.828125 93.949219 C 38.777344 93.925781 47.652344 54.996094 47.652344 54.996094 L 25.179688 54.996094 C 25.179688 54.996094 64.371094 4.457031 64.398438 4.480469 Z M 64.398438 4.480469 " />
        </g>
    </svg>`,

    lightning_bolt_thick: 
    `<? xml version="1.0" encoding="UTF-8" ?>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100px" height="100px" viewBox="0 0 100 100" version="1.1">
        <g id="surface1">
            <path style=" stroke:none;fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;" d="M 44.761719 28.234375 C 33.066406 43.234375 23.460938 55.585938 23.441406 55.664062 C 23.402344 55.761719 28.5625 55.835938 34.902344 55.835938 C 45.785156 55.835938 46.425781 55.855469 46.328125 56.164062 C 46 57.246094 36.546875 98.863281 36.605469 99 C 36.644531 99.152344 76.558594 39.5625 76.558594 39.328125 C 76.558594 39.273438 72.382812 39.214844 67.28125 39.214844 C 58.449219 39.214844 58.003906 39.195312 58.003906 38.867188 C 58.003906 38.671875 59.820312 30.089844 62.042969 19.769531 C 64.265625 9.464844 66.0625 1.019531 66.042969 1 C 66.042969 0.980469 56.457031 13.253906 44.761719 28.234375 Z M 56.089844 29.550781 L 53.246094 42.789062 L 61.425781 42.847656 C 65.929688 42.867188 69.601562 42.945312 69.601562 43.003906 C 69.601562 43.15625 44.800781 80.191406 44.742188 80.136719 C 44.703125 80.117188 46.054688 74.085938 47.738281 66.757812 C 49.421875 59.414062 50.871094 53.132812 50.945312 52.804688 L 51.082031 52.164062 L 41.011719 52.125 L 30.960938 52.066406 L 44.914062 34.167969 C 52.589844 24.3125 58.890625 16.269531 58.910156 16.289062 C 58.929688 16.289062 57.65625 22.261719 56.089844 29.550781 Z M 56.089844 29.550781 " />
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