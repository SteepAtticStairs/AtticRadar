const turf = require('@turf/turf');
const map = require('../radar/map/map');
const ut = require('../radar/utils');
const setLayerOrder = require('../radar/map/setLayerOrder');
const luxon = require('luxon');

// const url = `${ut.phpProxy}http://placefilenation.com/Placefiles/20lightning.php`;
const url = `${ut.phpProxy}https://saratoga-weather.org/USA-blitzortung/placefile.txt`;

function load_lightning() {
    fetch(url, {
        headers: {
            'User-Agent': 'GR2Analyst'
        }
    })
        .then(response => response.text())
        .then(data => {
            console.log(data)
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
                    if (diff_minutes <= 15) {
                        points.push(turf.point([lng, lat], { 'time': time, 'diff_minutes': diff_minutes }));
                    }
                }
            }
            var collection = turf.featureCollection(points);

            map.addSource('lightningSource', {
                type: 'geojson',
                data: collection
            });
            map.addLayer({
                'id': 'lightningLayer',
                'type': 'circle',
                'source': 'lightningSource',
                'paint': {
                    'circle-radius': 4,
                    'circle-stroke-width': 0.5,
                    'circle-color': [
                        'case',
                        ['<=', ['get', 'diff_minutes'], 3],
                        '#f3d03a',
                        ['<=', ['get', 'diff_minutes'], 6],
                        '#d6b524',
                        ['<=', ['get', 'diff_minutes'], 9],
                        '#b09213',
                        ['<=', ['get', 'diff_minutes'], 12],
                        '#947a0c',
                        ['<=', ['get', 'diff_minutes'], 15],
                        '#756004',

                        '#f3d03a'
                    ],
                    'circle-stroke-color': 'black'
                }
            });
            // map.addLayer({
            //     id: 'lightningLayer',
            //     type: 'symbol',
            //     source: {
            //         'type': 'geojson',
            //         'data': collection,
            //     },
            //     layout: {
            //         'icon-image': 'lightning_bolt',
            //         'icon-size': 0.2,
            //         'text-allow-overlap': true,
            //         'text-ignore-placement': true,
            //         'icon-allow-overlap': true,
            //         'icon-ignore-placement': true,
            //     },
            // })

            setLayerOrder();
        })
        .catch(error => {
            console.error(error);
        });
}

module.exports = load_lightning;