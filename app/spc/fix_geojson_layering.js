const turf = require('@turf/turf');

function fix_geojson_layering(geojson) {
    // convert all MultiPolygons to individual polygons within the FeatureCollection
    geojson.features = geojson.features.flatMap(feature => {
        if (feature.geometry.type === 'MultiPolygon') {
            const multipolygon = feature.geometry;
            return turf.getCoords(multipolygon).map(coords => turf.polygon(coords, feature.properties));
        } else if (feature.geometry.type === 'Polygon') {
            return feature;
        }
        return [];
    });

    for (var i = 0; i < geojson.features.length; i++) {
        const this_feature = geojson.features[i];
        const next_feature = geojson.features[i + 1];

        if (next_feature != undefined) {
            // console.log(this_feature, next_feature)
            const is_this_within = turf.booleanWithin(this_feature, next_feature);
            const is_next_within = turf.booleanWithin(next_feature, this_feature);

            if (is_this_within) { // surrounding one (bigger one) is "next_feature"
                next_feature.geometry.coordinates.push(...this_feature.geometry.coordinates);
            } else if (is_next_within) { // surrounding one (bigger one) is "this_feature"
                this_feature.geometry.coordinates.push(...next_feature.geometry.coordinates);
            }
        }
    }

    return geojson;
}

module.exports = fix_geojson_layering;