const map = require('../core/map/map');
const turf = require('@turf/turf');
const NEXRAD_LOCATIONS = require('../radar/libnexrad/nexrad_locations').NEXRAD_LOCATIONS;

function filter_lightning(total_hide = false) {
    if (total_hide) {
        const fc =  turf.featureCollection([]);
        if (map.getSource('lightningSource')) {
            map.getSource('lightningSource').setData(fc);
        }
        return fc;
    }

    var data = JSON.parse(JSON.stringify(window.atticData.original_lightning_points));
    const points = [];

    const current_station = window.atticData.currentStation;
    if (current_station != undefined) {
        const current_station_point = turf.point([NEXRAD_LOCATIONS[current_station].lon, NEXRAD_LOCATIONS[current_station].lat]);

        for (var i = 0; i < data.features.length; i++) {
            const coords = data.features[i].geometry.coordinates;
            const properties = data.features[i].properties;
            const point = turf.point(coords, properties);

            const distance = turf.distance(current_station_point, point, { units: 'kilometers' });
            if (distance <= 460) {
                points.push(point);
            }
        }

        const fc = turf.featureCollection(points);
        window.atticData.station_lightning = JSON.parse(JSON.stringify(fc));

        if (map.getSource('lightningSource')) {
            map.getSource('lightningSource').setData(fc);
        }
        return fc;
    } else {
        return turf.featureCollection([]);
    }
}

module.exports = filter_lightning;