const turf = require('@turf/turf');
const map = require('../core/map/map');
const ut = require('../core/utils');
const setLayerOrder = require('../core/map/setLayerOrder');
const luxon = require('luxon');
const icons = require('../core/map/icons/icons');
const filter_lightning = require('./filter_lightning');

// https://luker.org/resources/grlevelx/placefiles/

// const url = `${ut.phpProxy}http://placefilenation.com/Placefiles/20lightning.php`;
const url = `${ut.phpProxy}https://saratoga-weather.org/USA-blitzortung/placefile.txt`;

function load_lightning(callback) {
    fetch(url, {
        headers: {
            'User-Agent': 'GR2Analyst'
        }
    })
        .then(response => response.text())
        .then(data => {
            // console.log(data);
            console.log(`Fetched lightning data with a byte length of ${ut.formatBytes(new Blob([data]).size)}.`);
            data = data.split('\n');

            var points = [];
            for (var i in data) {
                var row = data[i];
                if (row.startsWith('Icon:')) {
                    row = row.replace('Icon: ', '');
                    row = row.split(',');

                    var lat = parseFloat(row[0]);
                    var lng = parseFloat(row[1]);
                    var time = row[5].replace('Blitzortung @ ', '').slice(0, -4);

                    // old format was "HH:mm:ss", e.g. "18:34:26" or "03:16:45"
                    // new format is "h:mm:ssa", e.g. "8:34:26am" or "7:30:33pm"
                    const date = luxon.DateTime.fromFormat(time, 'h:mm:ssa', { zone: 'America/Los_Angeles' }); // PDT
                    const diff = luxon.DateTime.now().diff(date);
                    const diff_minutes = diff.as('minutes');
                    const current_point = turf.point([lng, lat], { 'time': time, 'diff_minutes': diff_minutes });

                    if (diff_minutes <= 15) {
                        points.push(current_point);
                    }
                }
            }
            var collection = turf.featureCollection(points);
            window.atticData.original_lightning_points = collection;
            // collection = filter_lightning(collection);

            map.addSource('lightningSource', {
                type: 'geojson',
                data: collection
            });
            icons.add_icon_svg([
                [icons.icons.lightning_bolt_bold, 'lightning_bolt_bold']
            ], () => {
                const calculate_opacity_level = (decrease_rate) => Array.from({ length: 5 }, (_, i) => 1 - i * decrease_rate);
                const levels = calculate_opacity_level(0.125);

                map.addLayer({
                    id: 'lightningLayer',
                    type: 'symbol',
                    source: 'lightningSource',
                    layout: {
                        'icon-image': 'lightning_bolt_bold',
                        'icon-size': [
                            'interpolate',
                            ['exponential', 0.2],
                            ['zoom'],
                            7,
                            0.2,

                            10,
                            0.23
                        ],
                        // 'text-allow-overlap': true,
                        // 'text-ignore-placement': true,
                        // 'icon-allow-overlap': true,
                        // 'icon-ignore-placement': true,
                        'icon-padding': 0,
                        'symbol-sort-key': ['get', 'diff_minutes'],
                        'symbol-z-order': 'viewport-y'
                    },
                    paint: {
                        'icon-opacity': [
                            'case',
                            ['<=', ['get', 'diff_minutes'], 3],
                            levels[0],
                            ['<=', ['get', 'diff_minutes'], 6],
                            levels[1],
                            ['<=', ['get', 'diff_minutes'], 9],
                            levels[2],
                            ['<=', ['get', 'diff_minutes'], 12],
                            levels[3],
                            ['<=', ['get', 'diff_minutes'], 15],
                            levels[4],

                            levels[0],
                        ],
                    }
                })

                map.on('zoom', () => {
                    const map_zoom = map.getZoom();
                    if (map_zoom >= 7) {
                        map.setLayoutProperty('lightningLayer', 'icon-allow-overlap', true);
                        map.setLayoutProperty('lightningLayer', 'icon-ignore-placement', true);
                    } else {
                        map.setLayoutProperty('lightningLayer', 'icon-allow-overlap', false);
                        map.setLayoutProperty('lightningLayer', 'icon-ignore-placement', false);
                    }
                })

                // map.on('zoomend', () => {
                //     const bounds = map.getBounds();
                //     const top_left = [bounds.getNorthWest().lng, bounds.getNorthWest().lat];
                //     const top_right = [bounds.getNorthEast().lng, bounds.getNorthEast().lat];
                //     const bottom_left = [bounds.getSouthWest().lng, bounds.getSouthWest().lat];
                //     const bottom_right = [bounds.getSouthEast().lng, bounds.getSouthEast().lat];
                //     const bbox = turf.polygon([[top_left, top_right, bottom_left, bottom_right, top_left]]);

                //     // const lightning_within_view = turf.pointsWithinPolygon(collection, bbox);
                //     // map.getSource('lightningSource').setData(lightning_within_view);
                // })
                // map.on('zoomend', () => {
                //     // console.log('done');
                //     map.setLayoutProperty('lightningLayer', 'icon-allow-overlap', false);
                //     map.setLayoutProperty('lightningLayer', 'icon-ignore-placement', false);
                // })
                // map.on('zoomstart', () => {
                //     // console.log('done');
                //     map.setLayoutProperty('lightningLayer', 'icon-allow-overlap', true);
                //     map.setLayoutProperty('lightningLayer', 'icon-ignore-placement', true);
                // })

                setLayerOrder();
                callback();
            })
        })
        .catch(error => {
            console.error(error);
        });
}

module.exports = load_lightning;