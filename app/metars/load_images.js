const use_data = require('./use_data');
const create_circle_with_text = require('../core/misc/create_circle_with_text');
const get_temp_color = require('../core/misc/temp_colors');
const metar_plot = require('metar-plot');

function _add_image_to_map(image_url, image_name, callback) {
    const img = new Image(200, 200);
    img.onload = () => map.addImage(image_name, img);
    img.src = image_url;
}

function load_images(parsedXMLData) {
    var all_images_to_add = [];

    for (var i = 0; i < 120; i++) {
        const temp_color = get_temp_color(i);
        // const png_data = create_circle_with_text(`${degrees} °F`, tempColor[0], tempColor[1], 200, 0.75);
        const png_data = create_circle_with_text(`${i}`, temp_color[0], temp_color[1], 200, 1.2);
        all_images_to_add.push([png_data, `${i}`]);
    }

    // for (var item in parsedXMLData.response.data.METAR) {
    //     const base = parsedXMLData.response.data.METAR[item];
    //     if (base.hasOwnProperty('station_id') && base.hasOwnProperty('raw_text')) {
    //         var stationId = base.station_id['#text'];
    //         var rawMetarText = base.raw_text['#text'];

    //         try {
    //             const metar_img_data = metar_plot.metarToImgSrc(metar_plot.rawMetarToMetarPlot(rawMetarText));
    //             all_images_to_add.push([metar_img_data, stationId]);
    //         } catch (e) {
    //             console.warn(e);
    //         }
    //     }
    // }

    for (let i = 0; i < all_images_to_add.length; i++) {
        _add_image_to_map(all_images_to_add[i][0], all_images_to_add[i][1]);
    }

    use_data.useData(parsedXMLData);
}

module.exports = load_images;