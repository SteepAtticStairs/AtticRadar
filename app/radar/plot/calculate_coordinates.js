const plot_to_map = require('./plot_to_map');
const product_colors = require('../colormaps/colormaps');
const ut = require('../../core/utils')
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

    const dealias_mode_region_based = $('#armrDealiasRegionBasedBtnSwitchElem').is(':checked');
    const dealias_mode_tornadic = $('#armrDealiasTornadicBtnSwitchElem').is(':checked');

    var should_plot_dealiased;
    if (nexrad_factory.nexrad_level == 2 && product == 'VEL') {
        should_plot_dealiased = window.atticData.should_plot_dealiased;

        if (dealias_mode_tornadic) {
            if (should_plot_dealiased) {
                nexrad_factory.dealias_alt_and_plot(elevation - 1, () => {});
                return;
            }
        }
        if (dealias_mode_region_based) {
            var already_dealiased = nexrad_factory.check_if_already_dealiased(elevation);
            if (should_plot_dealiased && !already_dealiased) {
                nexrad_factory.dealias(elevation);
            }
        }
    }

    var azimuths = nexrad_factory.get_azimuth_angles(elevation);
    var ranges = nexrad_factory.get_ranges(product, elevation);
    var data;
    if (nexrad_factory.nexrad_level == 2) {
        data = nexrad_factory.get_data(product, elevation, should_plot_dealiased);
    } else {
        data = nexrad_factory.get_data(product, elevation);
    }

    var location = nexrad_factory.get_location();
    var radar_lat_lng = {'lat': location[0], 'lng': location[1]};
    var radar_lat = deg2rad(radar_lat_lng.lat);
    var radar_lng = deg2rad(radar_lat_lng.lng);

    var color_data = product_colors[product];
    var values = [...color_data.values];
    values = ut.scaleValues(values, product);
    var chroma_scale = chroma.scale(color_data.colors).domain(values).mode('lab');
    window.atticData.webgl_chroma_scale = chroma_scale;

    var total = 0;
    var data_copy = [...data];
    for (var i in data_copy) {
        data_copy[i] = data_copy[i].filter(function (el) { return el != null });
        total += data_copy[i].length;
    }

    var points = new Float32Array(total * 12);
    var colors = new Float32Array(total * 6);
    var points_index = 0;
    var colors_index = 0;

    function push_point(pointArray) {
        for (var i = 0; i < pointArray.length; i++) {
            points[points_index++] = pointArray[i];
        }
    }

    function push_color(colorArray) {
        for (var i = 0; i < colorArray.length; i++) {
            colors[colors_index++] = colorArray[i];
        }
    }

    function get_azimuth_distance(i, n) {
        return {
            azimuth: azimuths[i],
            distance: ranges[n]
        };
    }

    for (var i = 0; i < azimuths.length - 1; i++) {
        for (var n = 0; n < ranges.length - 1; n++) {
            try {
                if (data[i][n] !== null) {
                    var base_locs = get_azimuth_distance(i, n);
                    // var base = destVincenty(base_locs.azimuth, base_locs.distance);

                    var one_up_locs = get_azimuth_distance(i, n + 1);
                    // var one_up = destVincenty(one_up_locs.azimuth, one_up_locs.distance);

                    var one_sideways_locs = get_azimuth_distance(i + 1, n);
                    // var one_sideways = destVincenty(one_sideways_locs.azimuth, one_sideways_locs.distance);

                    var other_corner_locs = get_azimuth_distance(i + 1, n + 1);
                    // var other_corner = destVincenty(other_corner_locs.azimuth, other_corner_locs.distance);

                    push_point([
                        base_locs.azimuth,
                        base_locs.distance,
                        one_up_locs.azimuth,
                        one_up_locs.distance,
                        one_sideways_locs.azimuth,
                        one_sideways_locs.distance,
                        one_sideways_locs.azimuth,
                        one_sideways_locs.distance,
                        one_up_locs.azimuth,
                        one_up_locs.distance,
                        other_corner_locs.azimuth,
                        other_corner_locs.distance
                    ]);

                    var color = data[i][n];
                    push_color([
                        color,
                        color,
                        color,
                        color,
                        color,
                        color
                    ]);
                    // push_color([
                    //     data[i][n],
                    //     data[i][n + 1],
                    //     data[i + 1][n],
                    //     data[i + 1][n],
                    //     data[i][n + 1],
                    //     data[i + 1][n + 1],
                    // ]);
                }
            } catch (e) {
                // console.warn(e)
            }
        }
    }

    var w = work(require('./calculation_worker'));
    w.addEventListener('message', function(ev) {
        console.log(`Calculated vertices in ${Date.now() - start} ms`);
        plot_to_map(ev.data, colors, product, nexrad_factory);
    })
    w.postMessage([points, radar_lat_lng], [points.buffer]);
}

module.exports = calculate_coordinates;