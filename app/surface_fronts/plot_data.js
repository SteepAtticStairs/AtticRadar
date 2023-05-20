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

function _return_fronts_feature_collection(key, SurfaceFronts) {
    const lines = [];
    for (var i = 0; i < SurfaceFronts.fronts[key].length; i++) {
        const base = SurfaceFronts.fronts[key][i];
        const linestring = turf.lineString(base.coordinates, { strength: base.strength });
        lines.push(linestring);
    }
    const feature_collection = turf.featureCollection(lines);
    return feature_collection;
}

function _return_pressure_point_feature_collection(key, SurfaceFronts) {
    const points = [];
    for (var i = 0; i < SurfaceFronts[`${key}s`][`${key}s_formatted`].length; i++) {
        const base = SurfaceFronts[`${key}s`][`${key}s_formatted`][i];
        const point = turf.point(base.coordinates, { pressure: base.pressure });
        points.push(point);
    }
    const feature_collection = turf.featureCollection(points);
    return feature_collection;
}

function _add_front_layer(front_type, feature_collection, color) {
    front_type = front_type.toLowerCase();

    var paint = {
        'line-color': color,
        'line-width': 4
    }
    if (front_type == 'trough') {
        paint = {
            'line-color': color,
            'line-width': 2.5,
            'line-dasharray': [2, 3]
        }
    }

    map.addLayer({
        'id': `${front_type}_front_layer`,
        'type': 'line',
        'source': {
            type: 'geojson',
            data: feature_collection
        },
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': paint
    });
}

function _add_pressure_point_layer(type, feature_collection) {
    type = type.toLowerCase();

    var letter;
    var color;
    if (type == 'high') {
        letter = 'H';
        color = blue;
    } else if (type == 'low') {
        letter = 'L';
        color = red;
    }

    map.addLayer({
        'id': `${type}_pressure_point_layer`,
        'type': 'symbol',
        'source': {
            type: 'geojson',
            data: feature_collection
        },
        'layout': {
            'text-field': letter,
            'text-size': 50,
            'text-font': ['Open Sans Bold']
        },
        'paint': {
            'text-color': color
        }
    });
}

function plot_data(SurfaceFronts) {
    const warm_front_collection = _return_fronts_feature_collection('warm', SurfaceFronts);
    const cold_front_collection = _return_fronts_feature_collection('cold', SurfaceFronts);
    const occluded_front_collection = _return_fronts_feature_collection('occluded', SurfaceFronts);
    const trough_front_collection = _return_fronts_feature_collection('trough', SurfaceFronts);

    const highs_collection = _return_pressure_point_feature_collection('high', SurfaceFronts);
    const lows_collection = _return_pressure_point_feature_collection('low', SurfaceFronts);

    wait_for_map_load(() => {
        _add_front_layer('warm', warm_front_collection, red);
        _add_front_layer('cold', cold_front_collection, blue);
        _add_front_layer('occluded', occluded_front_collection, purple);
        _add_front_layer('trough', trough_front_collection, orange);

        _add_pressure_point_layer('high', highs_collection);
        _add_pressure_point_layer('low', lows_collection);

        set_layer_order();
    })
}

module.exports = plot_data;