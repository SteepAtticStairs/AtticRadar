const use_data = require('./use_data');
const create_circle_with_text = require('../core/misc/create_circle_with_text');
const get_temp_color = require('../core/misc/temp_colors');

function loadImage(imageUrl) {
    return new Promise((resolve, reject) => {
        map.loadImage(imageUrl, (error, image) => {
            if (error) reject(error);
            else resolve(image);
        });
    });
}

function _add_circle_image_to_map(degrees, tempColor, callback) {
    // const png_data = create_circle_with_text(`${degrees} °F`, tempColor[0], tempColor[1], 200, 0.75);
    const png_data = create_circle_with_text(`${degrees}`, tempColor[0], tempColor[1], 200, 1.2);
    loadImage(png_data)
        .then((image) => {
            // Add the image to the map style.
            map.addImage(`${degrees}`, image);
            callback();
        })
        .catch((error) => {
            throw error;
        });
}

function load_images(parsedXMLData) {
    let count = 0;
    const total = 100;

    function addImageCallback() {
        count++;
        // console.log(`Image ${count} added to the map.`);
        if (count === total) {
            use_data.useData(parsedXMLData);
        }
    }

    for (let i = 10; i < 110; i++) {
        _add_circle_image_to_map(i, get_temp_color(i), addImageCallback);
    }
}

module.exports = load_images;