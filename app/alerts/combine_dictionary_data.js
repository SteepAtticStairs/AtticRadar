// const geojsonMerge = require('@mapbox/geojson-merge');
const turf = require('@turf/turf');
const map = require('../core/map/map');
const merge_polygons = require('./merge_polygons');

function combine_dictionary_data(alerts_data) {
    const polygons = [];
    for (var item in alerts_data.features) {
        if (alerts_data.features[item].geometry == null) {
            var affectedZones = alerts_data.features[item].properties.affectedZones;
            for (var i in affectedZones) {
                var zoneToPush;
                if (affectedZones[i].includes('forecast')) {
                    alerts_data.features[item].properties.zone_type = 'forecast';
                    affectedZones[i] = affectedZones[i].replace('https://api.weather.gov/zones/forecast/', '');
                    zoneToPush = forecast_zones[affectedZones[i]];
                } else if (affectedZones[i].includes('county')) {
                    alerts_data.features[item].properties.zone_type = 'county';
                    affectedZones[i] = affectedZones[i].replace('https://api.weather.gov/zones/county/', '');
                    zoneToPush = county_zones[affectedZones[i]];
                } else if (affectedZones[i].includes('fire')) {
                    alerts_data.features[item].properties.zone_type = 'fire';
                    affectedZones[i] = affectedZones[i].replace('https://api.weather.gov/zones/fire/', '');
                    zoneToPush = fire_zones[affectedZones[i]];
                }
                if (zoneToPush != undefined) {
                    const polygon = turf.feature(zoneToPush.geometry, alerts_data.features[item].properties);
                    polygons.push(polygon);
                }
            }
        }
    }

    // const polygon_collection = turf.featureCollection(polygons);
    const polygon_collection = merge_polygons(polygons);

    var merged_geoJSON = geojson_merge([
        polygon_collection,
        alerts_data
    ]);
    return merged_geoJSON;
}

// https://github.com/mapbox/geojson-normalize/blob/master/index.js
var types = {
    Point: 'geometry',
    MultiPoint: 'geometry',
    LineString: 'geometry',
    MultiLineString: 'geometry',
    Polygon: 'geometry',
    MultiPolygon: 'geometry',
    GeometryCollection: 'geometry',
    Feature: 'feature',
    FeatureCollection: 'featurecollection'
};

/**
 * Normalize a GeoJSON feature into a FeatureCollection.
 *
 * @param {object} gj geojson data
 * @returns {object} normalized geojson data
 */
function normalize(gj) {
    if (!gj || !gj.type) return null;
    var type = types[gj.type];
    if (!type) return null;

    if (type === 'geometry') {
        return {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: gj
            }]
        };
    } else if (type === 'feature') {
        return {
            type: 'FeatureCollection',
            features: [gj]
        };
    } else if (type === 'featurecollection') {
        return gj;
    }
}

// https://github.com/mapbox/geojson-merge/blob/master/index.js#L22
function geojson_merge(inputs) {
    var output = {
        type: 'FeatureCollection',
        features: []
    };
    for (var i = 0; i < inputs.length; i++) {
        var normalized = normalize(inputs[i]);
        for (var j = 0; j < normalized.features.length; j++) {
            output.features.push(normalized.features[j]);
        }
    }
    return output;
}

module.exports = combine_dictionary_data;