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

    var index = 0;
    for (var i = 0; i < geojson.features.length; i++) {
        const this_feature = geojson.features[i];
        this_feature.properties.zindex = 0;

        for (var j = i + 1; j < geojson.features.length; j++) {
            const next_feature = geojson.features[j];
            next_feature.properties.zindex = 0;

            const is_this_within = turf.booleanWithin(this_feature, next_feature);
            const is_next_within = turf.booleanWithin(next_feature, this_feature);
            // console.log(is_this_within, is_next_within);
            // console.log(this_feature, next_feature);

            if (is_this_within) { // surrounding one (bigger one) is "next_feature"
                const polygonA = next_feature.geometry.coordinates[next_feature.geometry.coordinates.length - 1];
                const polygonB = this_feature.geometry.coordinates[0];
                const is_equal = turf.booleanEqual(turf.polygon([polygonA]), turf.polygon([polygonB]));
                if (!is_equal) {
                    next_feature.geometry.coordinates.push(...this_feature.geometry.coordinates);
                    index++;
                    this_feature.properties.zindex = index;
                }
            } else if (is_next_within) { // surrounding one (bigger one) is "this_feature"
                const polygonA = this_feature.geometry.coordinates[this_feature.geometry.coordinates.length - 1];
                const polygonB = next_feature.geometry.coordinates[0];
                const is_equal = turf.booleanEqual(turf.polygon([polygonA]), turf.polygon([polygonB]));
                if (!is_equal) {
                    this_feature.geometry.coordinates.push(...next_feature.geometry.coordinates);
                    index++;
                    next_feature.properties.zindex = index;
                }
            }
        }
    }

    return geojson;
}

module.exports = fix_geojson_layering;