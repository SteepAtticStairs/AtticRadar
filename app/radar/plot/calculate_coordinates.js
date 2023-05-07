const plot_to_map = require('./plot_to_map');
const product_colors = require('../products/productColors');
const ut = require('../utils')
const chroma = require('chroma-js');
const work = require('webworkify');

function deg2rad(angle) { return angle * (Math.PI / 180) }

function calculate_coordinates(nexrad_factory, options) {
    const start = Date.now();

    var product;
    var elevation;
    if (nexrad_factory.nexrad_level == 2) {
        product = options.product;
        elevation = options.elevation;
        window.atticData.product_code = product;
    } else if (nexrad_factory.nexrad_level == 3) {
        product = nexrad_factory.product_abbv;
        window.atticData.product_code = nexrad_factory.product_code;
    }
    window.atticData.product = product;

    var azimuths = nexrad_factory.get_azimuth_angles(elevation);
    var data = nexrad_factory.get_data(product, elevation);
    var ranges = nexrad_factory.get_ranges(product, elevation);

    var location = nexrad_factory.get_location();
    var radar_lat_lng = {'lat': location[0], 'lng': location[1]};
    var radar_lat = deg2rad(radar_lat_lng.lat);
    var radar_lng = deg2rad(radar_lat_lng.lng);

    var color_data = product_colors[product];
    var values = [...color_data.values];
    values = ut.scaleValues(values, product);
    var chroma_scale = chroma.scale(color_data).domain(values).mode('lab');

    var total = 0;
    var data_copy = [...data];
    for (var i in data_copy) {
        data_copy[i] = data_copy[i].filter(function (el) { return el != null });
        total += data_copy[i].length;
    }

    var points = new Float32Array(total * 12);
    var points_index = 0;
    function push_point(value) {
        points[points_index] = value;
        points_index++;
    }

    var colors = new Float32Array(total * 6);
    var colors_index = 0;
    function push_color(value) {
        colors[colors_index] = value;
        colors_index++;
    }

    function get_azimuth_distance(i, n) {
        return {
            'azimuth': azimuths[i],
            'distance': ranges[n]
        }
    }

    for (var i in azimuths) {
        for (var n in ranges) {
            try {
                if (data[i][n] != null) {
                    //var theN = parseInt(goodIndexes[i][n]);
                    i = parseInt(i);
                    n = parseInt(n);
                    var base_locs = get_azimuth_distance(i, n);
                    //var base = destVincenty(base_locs.azimuth, base_locs.distance);

                    var one_up_locs = get_azimuth_distance(i, n + 1);
                    //var one_up = destVincenty(one_up_locs.azimuth, one_up_locs.distance);

                    var one_sideways_locs = get_azimuth_distance(i + 1, n);
                    //var one_sideways = destVincenty(one_sideways_locs.azimuth, one_sideways_locs.distance);

                    var other_corner_locs = get_azimuth_distance(i + 1, n + 1);
                    //var other_corner = destVincenty(other_corner_locs.azimuth, other_corner_locs.distance);

                    push_point(base_locs.azimuth);
                    push_point(base_locs.distance);

                    push_point(one_up_locs.azimuth);
                    push_point(one_up_locs.distance);

                    push_point(one_sideways_locs.azimuth);
                    push_point(one_sideways_locs.distance);
                    push_point(one_sideways_locs.azimuth);
                    push_point(one_sideways_locs.distance);

                    push_point(one_up_locs.azimuth);
                    push_point(one_up_locs.distance);

                    push_point(other_corner_locs.azimuth);
                    push_point(other_corner_locs.distance);


                    push_color(data[i][n]);
                    push_color(data[i][n]);
                    push_color(data[i][n]);
                    push_color(data[i][n]);
                    push_color(data[i][n]);
                    push_color(data[i][n]);

                    // push_color(data[i][n]);
                    // push_color(data[i][n + 1]);
                    // push_color(data[i + 1][n]);
                    // push_color(data[i + 1][n]);
                    // push_color(data[i][n + 1]);
                    // push_color(data[i + 1][n + 1]);
                }
            } catch (e) {
                // console.warn(e)
            }
        }
    }

    var w = work(require('./calculation_worker'));
    w.addEventListener('message', function(ev) {
        console.log(`Calculated vertices in ${Date.now() - start} ms`);
        plot_to_map(ev.data, colors, product, radar_lat_lng, nexrad_factory);
    })
    w.postMessage([points, radar_lat_lng], [points.buffer]);
}

module.exports = calculate_coordinates;