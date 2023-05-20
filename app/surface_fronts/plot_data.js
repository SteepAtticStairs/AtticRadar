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

function wait_for_map_load(func) {
    setTimeout(function() {
        if (map.loaded()) {
            func();
        } else {
            map.on('load', function() {
                func();
            })
        }
    }, 0)
}

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
        const linestring = turf.lineString(base.coordinates, properties);
        lines.push(linestring);
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

function plot_data(SurfaceFronts) {
    const warm_front_linestrings = _return_fronts_linestrings('warm', SurfaceFronts);
    const cold_front_linestrings = _return_fronts_linestrings('cold', SurfaceFronts);
    const occluded_front_linestrings = _return_fronts_linestrings('occluded', SurfaceFronts);
    const trough_front_linestrings = _return_fronts_linestrings('trough', SurfaceFronts);
    const all_fronts_linestrings = turf.featureCollection([
        ...warm_front_linestrings,
        ...cold_front_linestrings,
        ...occluded_front_linestrings,
        ...trough_front_linestrings
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

        set_layer_order();
    })
}

module.exports = plot_data;