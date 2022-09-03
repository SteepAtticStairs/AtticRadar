var map = require('../radar/map/map');

function drawHurricanesToMap(geojson, type) {
    map.on('load', () => {
        if (type == 'cone') {
            map.addLayer({
                'id': `newAlertsLayer`,
                'type': 'fill',
                'source': {
                    type: 'geojson',
                    data: geojson,
                },
                paint: {
                    //#0080ff blue
                    //#ff7d7d red
                    'fill-color': '#0080ff',
                    'fill-opacity': 0.5
                }
            });
            map.addLayer({
                'id': `newAlertsLayerOutline`,
                'type': 'line',
                'source': `newAlertsLayer`,
                'paint': {
                    //#014385 blue
                    //#850101 red
                    'line-color': '#014385',
                    'line-width': 3
                }
            });
        } else if (type == 'track') {
            map.addLayer({
                'id': 'trackLayerLine',
                'type': 'line',
                'source': {
                    type: 'geojson',
                    data: geojson,
                },
                'paint': {
                    'line-color': '#ffffff',
                    'line-width': 2
                }
            });
            map.addLayer({
                'id': 'trackLayerPoints',
                'type': 'circle',
                'source': {
                    'type': 'geojson',
                    'data': geojson,
                },
                'paint': {
                    'circle-radius': 4,
                    'circle-stroke-width': 2,
                    'circle-color': 'red',
                    'circle-stroke-color': 'white'
                }
            })
        }
    })
}

module.exports = drawHurricanesToMap;