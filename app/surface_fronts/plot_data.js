const map = require('../core/map/map');
const turf = require('@turf/turf');
const set_layer_order = require('../core/map/setLayerOrder');

/**
 * https://www.wpc.ncep.noaa.gov/html/fntcodes2.shtml
 */
const blue = 'rgb(0, 100, 245)'; // 'rgb(0, 0, 245)';
const red = 'rgb(234, 51, 35)';
const purple = 'rgb(95, 54, 196)';
const orange = 'rgb(194, 115, 47)';
const green = 'rgb(0, 255, 0)';

function wait_for_map_load(func) {
    func();
    // setTimeout(function() {
    //     if (map.loaded()) {
    //         func();
    //     } else {
    //         map.on('load', function() {
    //             func();
    //         })
    //     }
    // }, 0)
}

function _copy(object) {
    return JSON.parse(JSON.stringify(object));
}

/**
 * From ChatGPT
 */
// const calculate_midpoint = (point1, point2) => [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
const calculate_midpoint = (point1, point2) => turf.midpoint(turf.point(point1), turf.point(point2)).geometry.coordinates;
const add_midpoints = array =>
    array.flatMap((point, index) => (index < array.length - 1 ? [point, calculate_midpoint(point, array[index + 1])] : [point]));

function _return_fronts_linestrings(key, SurfaceFronts) {
    const properties = {
        width: 4,
        dasharray: [],
    };
    if (key == 'warm') {
        properties.color = red;
    } else if (key == 'cold') {
        properties.color = blue;
    } else if (key == 'occluded') {
        properties.color = purple;
    } else if (key == 'trough') {
        properties.color = orange;
        properties.width = 2.5;
        properties.dasharray = [2, 3];
    }

    const lines = [];
    for (var i = 0; i < SurfaceFronts.fronts[key].length; i++) {
        const base = SurfaceFronts.fronts[key][i];
        properties.strength = base.strength;
        base.coordinates = add_midpoints(base.coordinates);

        if (key == 'stationary') {
            var last_color = red;
            for (var n = 0; n < base.coordinates.length - 2; n += 2) {
                if (last_color == red) last_color = blue;
                else if (last_color == blue) last_color = red;
                properties.color = last_color;

                const sub_array = base.coordinates.slice(n, n + 3);
                const linestring = turf.lineString(sub_array, _copy(properties));
                lines.push(linestring);
            }
        } else {
            const linestring = turf.lineString(base.coordinates, properties);
            lines.push(linestring);
        }
    }
    return lines;
}

function _add_fronts_layer(feature_collection) {
    map.addLayer({
        'id': `fronts_layer`,
        'type': 'line',
        'source': {
            type: 'geojson',
            data: feature_collection
        },
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': ['get', 'color'],
            'line-width': ['get', 'width'],
            'line-dasharray': ['get', 'dasharray'],
        }
    });
}

function _return_pressure_points(key, SurfaceFronts) {
    const properties = {};
    if (key == 'high') {
        properties.color = blue;
        properties.letter = 'H';
    } else if (key == 'low') {
        properties.color = red;
        properties.letter = 'L';
    }

    const points = [];
    for (var i = 0; i < SurfaceFronts[`${key}s`][`${key}s_formatted`].length; i++) {
        const base = SurfaceFronts[`${key}s`][`${key}s_formatted`][i];
        properties.pressure = base.pressure;
        const point = turf.point(base.coordinates, properties);
        points.push(point);
    }
    return points;
}

function _add_pressure_point_layer(feature_collection) {
    map.addLayer({
        'id': `pressure_points_layer`,
        'type': 'symbol',
        'source': {
            type: 'geojson',
            data: feature_collection
        },
        'layout': {
            'text-field': ['get', 'letter'],
            'text-size': 50,
            'text-font': ['Open Sans Bold']
        },
        'paint': {
            'text-color': ['get', 'color']
        }
    });
}

function _return_symbols_points(key, SurfaceFronts) {
    var properties = {};

    const semicircle_offset = [0, 20];
    const semicircle_size = 0.2;
    const semicircle_modifier = -90;

    const triangle_offset = [0, 0];
    const triangle_size = 0.16;
    const triangle_modifier = -90;

    if (key == 'warm') {
        properties.modifier = semicircle_modifier;
        properties.image = 'red_semicircle';
        properties.size = semicircle_size;
        properties.offset = semicircle_offset;
    } else if (key == 'cold') {
        properties.modifier = triangle_modifier;
        properties.image = 'blue_triangle';
        properties.size = triangle_size;
        properties.offset = triangle_offset;
    }

    const points = [];
    const base = SurfaceFronts.fronts[key];
    for (var n = 0; n < base.length; n++) {
        var last_symbol = 'semicircle';
        for (var i = 0; i < base[n].coordinates.length; i++) {
            const current_point = base[n].coordinates[i];
            const next_point = base[n].coordinates[i + 1];
            if (i % 2 != 0) { // we're on a midpoint
                const midpoint = turf.point(current_point);
                const bearing = turf.bearing(turf.point(current_point), turf.point(next_point));

                // occluded and stationary fronts have alternating symbols
                if (key == 'occluded' || key == 'stationary') {
                    if (last_symbol == 'semicircle') {
                        last_symbol = 'triangle';

                        if (key == 'occluded') properties.image = `purple_${last_symbol}`;
                        else if (key == 'stationary') properties.image = `blue_${last_symbol}`;

                        properties.modifier = triangle_modifier;
                        properties.size = triangle_size;
                        properties.offset = triangle_offset;
                    } else if (last_symbol == 'triangle') {
                        last_symbol = 'semicircle';

                        if (key == 'occluded') properties.image = `purple_${last_symbol}`;
                        else if (key == 'stationary') properties.image = `red_${last_symbol}`;

                        properties.modifier = semicircle_modifier;
                        properties.size = semicircle_size;
                        properties.offset = semicircle_offset;
                    }
                }

                properties.bearing = bearing;
                midpoint.properties = _copy(properties);
                points.push(midpoint);
            }
        }
    }
    return points;
}

function _add_front_symbols_layer(feature_collection) {
    map.addLayer({
        'id': `front_symbols_layer`,
        'type': 'symbol',
        'source': {
            type: 'geojson',
            data: feature_collection
        },
        'layout': {
            'icon-image': ['get', 'image'],
            'icon-size': ['get', 'size'],
            'icon-offset': ['get', 'offset'],
            'icon-anchor': 'bottom',
            'icon-rotate': ['+', ['get', 'modifier'], ['get', 'bearing']]
        }
    });
}

function plot_data(SurfaceFronts) {
    const warm_front_linestrings = _return_fronts_linestrings('warm', SurfaceFronts);
    const cold_front_linestrings = _return_fronts_linestrings('cold', SurfaceFronts);
    const occluded_front_linestrings = _return_fronts_linestrings('occluded', SurfaceFronts);
    const trough_front_linestrings = _return_fronts_linestrings('trough', SurfaceFronts);
    const stationary_front_linestrings = _return_fronts_linestrings('stationary', SurfaceFronts);
    const all_fronts_linestrings = turf.featureCollection([
        ...warm_front_linestrings,
        ...cold_front_linestrings,
        ...occluded_front_linestrings,
        ...trough_front_linestrings,
        ...stationary_front_linestrings
    ]);

    const warm_front_symbols_points = _return_symbols_points('warm', SurfaceFronts);
    const cold_front_symbols_points = _return_symbols_points('cold', SurfaceFronts);
    const occluded_front_symbols_points = _return_symbols_points('occluded', SurfaceFronts);
    const stationary_front_symbols_points = _return_symbols_points('stationary', SurfaceFronts);
    const all_front_symbols_points = turf.featureCollection([
        ...warm_front_symbols_points,
        ...cold_front_symbols_points,
        ...occluded_front_symbols_points,
        ...stationary_front_symbols_points
    ]);

    const highs_points = _return_pressure_points('high', SurfaceFronts);
    const lows_points = _return_pressure_points('low', SurfaceFronts);
    const all_pressure_points_linestrings = turf.featureCollection([
        ...highs_points,
        ...lows_points,
    ]);

    wait_for_map_load(() => {
        _add_fronts_layer(all_fronts_linestrings);
        _add_pressure_point_layer(all_pressure_points_linestrings);
        _add_front_symbols_layer(all_front_symbols_points);

        set_layer_order();
    })
}

module.exports = plot_data;