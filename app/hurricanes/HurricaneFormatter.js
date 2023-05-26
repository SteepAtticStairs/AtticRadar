const turf = require('@turf/turf');

class HurricaneFormatter {
    constructor(master_storms_list) {
        this.master_storms_list = master_storms_list;

        this.parse_cone();
    }

    parse_cone() {
        const keys = Object.keys(this.master_storms_list.jtwc);
        for (var i = 0; i < keys.length; i++) {
            const current_storm = keys[i];
            const geojson = this.master_storms_list.jtwc[current_storm].geojson;

            const points = [];
            for (var n = 0; n < geojson.features.length; n++) {
                const name = geojson.features[n].properties.name;
                const type = geojson.features[n].geometry.type;

                if (type == 'Point') {
                    points.push(geojson.features[n]);
                }

                if (name == '34 knot Danger Swath') {
                    this.master_storms_list.jtwc[current_storm].cone = geojson.features[n];
                } else if (name == 'wp02 Storm Track') {
                    this.master_storms_list.jtwc[current_storm].forecast_track = geojson.features[n];
                }
            }
            this.master_storms_list.jtwc[current_storm].forecast_points = turf.featureCollection(points);
        }
    }
}

module.exports = HurricaneFormatter;