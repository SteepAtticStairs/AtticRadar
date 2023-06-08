const turf = require('@turf/turf');
const hash_string = require('./hash_string');

function merge_polygons(polygons) {
    // // const zs = ['MSZ001', 'MSZ007', 'MSZ008', 'MSZ010', 'MSZ011', 'MSZ012', 'MSZ020'];
    // const zs = ['PZZ252', 'PZZ253', 'PZZ272', 'PZZ273'];

    // const shapes = [];
    // for (var i = 0; i < zs.length; i++) {
    //     shapes.push(...turf.explode(forecast_zones[zs[i]]).features);
    // }

    // const fc = turf.featureCollection(shapes);
    // const outline = turf.convex(fc);

    // map.addLayer({
    //     'id': 'outline',
    //     'type': 'line',
    //     'source': {
    //         'type': 'geojson',
    //         'data': outline
    //     },
    //     'layout': {},
    //     'paint': {
    //         'line-color': '#0080ff',
    //         'line-width': 3
    //     }
    // });
    // return turf.featureCollection(polygons);

    const lookup = {};
    for (var i = 0; i < polygons.length; i++) {
        const properties = polygons[i].properties;
        const affected_zones = properties.affectedZones;

        const id = hash_string(JSON.stringify(properties));
        // var id = properties.parameters?.VTEC?.[0];
        // if (id == undefined) {
        //     id = properties.parameters?.WMOidentifier?.[0];
        // }

        lookup[id] = {
            'properties': properties,
            'affected_zones': affected_zones
        }
    }

    const outlines = [];
    const keys = Object.keys(lookup);
    for (var i = 0; i < keys.length; i++) {
        const shapes = [];
        const key = keys[i];

        const zs = lookup[key].affected_zones;
        for (var n = 0; n < zs.length; n++) {
            var zones;
            if (lookup[key].properties.zone_type == 'forecast') { zones = forecast_zones }
            else if (lookup[key].properties.zone_type == 'county') { zones = county_zones }
            else if (lookup[key].properties.zone_type == 'fire') { zones = fire_zones }

            if (zones[zs[n]] != undefined) {
                const exploded = turf.explode(zones[zs[n]]).features;
                shapes.push(...exploded);
            }
        }
        const fc = turf.featureCollection(shapes);
        const outline = turf.convex(fc);
        outline.properties = lookup[key].properties;
        outlines.push(outline);

        // outline.properties.type = 'border';
        // outlines.push(JSON.parse(JSON.stringify(outline)));
        // outline.properties.type = 'outline';
        // outlines.push(JSON.parse(JSON.stringify(outline)));
    }

    const polygon_collection = turf.featureCollection(outlines);
    var duplicate_features = polygon_collection.features.flatMap((element) => [element, element]);
    duplicate_features = JSON.parse(JSON.stringify(duplicate_features));
    for (var i = 0; i < duplicate_features.length; i++) {
        if (i % 2 === 0) {
            duplicate_features[i].properties.type = 'border';
        } else {
            duplicate_features[i].properties.type = 'outline';
        }
    }
    polygon_collection.features = duplicate_features;

    return polygon_collection;
}

module.exports = merge_polygons;