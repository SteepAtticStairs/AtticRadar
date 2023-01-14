const nwrStations = require('./data/nwrStations');
const turf = require('@turf/turf');
var map = require('../radar/map/map');

function plotToMap() {
    console.log(nwrStations);

    var coords = [];
    for (var i in nwrStations) {
        try {
            var point = turf.point([parseFloat(nwrStations[i].LON), parseFloat(nwrStations[i].LAT)], nwrStations[i]);
            coords.push(point);
        } catch (e) { /*console.warn(e)*/ }
    }

    var radioStationGeojson = turf.featureCollection(coords);

    function addToMap() {
        map.addSource('radioStationSource', {
            type: 'geojson',
            data: radioStationGeojson
        });
        map.addLayer({
            'id': 'radioStationLayer',
            'type': 'circle',
            'source': 'radioStationSource',
            'paint': {
                'circle-radius': 4,
                'circle-color': [
                    'case',
                    ['==', ['get', 'STATUS'], 'NORMAL'],
                    '#16a61a', // lighter green
                    ['==', ['get', 'STATUS'], 'OUT OF SERVICE'],
                    '#de1818', // lighter red
                    'black'
                ],
                'circle-stroke-width': 4,
                'circle-stroke-color': [
                    'case',
                    ['==', ['get', 'STATUS'], 'NORMAL'],
                    '#107514', // darker green
                    ['==', ['get', 'STATUS'], 'OUT OF SERVICE'],
                    '#991111', // darker red
                    'black'
                ],
            }
        });

        // we want the radar station layer to be on top of the weather radio layer
        if (map.getLayer('stationSymbolLayer')) { map.moveLayer('stationSymbolLayer') }

        map.on('click', 'radioStationLayer', (e) => {
            // console.log(`${e.features[0].properties.LAT}, ${e.features[0].properties.LON}`);
            const properties = e.features[0].properties;
            console.log(properties);

            const popupContents = `
<div><b>${properties.CALLSIGN}</b></div>
<div>${properties.FREQ}</div>
<div>${properties.SITENAME}, ${properties.SITESTATE}</div>`

            const popup = new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000' })
                .setLngLat([properties.LON, properties.LAT])
                .setHTML(popupContents)
                .addTo(map);
        })

        map.on('mouseenter', 'radioStationLayer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'radioStationLayer', () => {
            map.getCanvas().style.cursor = '';
        });

        // map.on('click', (e) => {
        //     const popup = new mapboxgl.Popup({ className: 'alertPopup', maxWidth: '1000' })
        //         .setLngLat(e.lngLat) // [-98.5606744, 36.8281576]
        //         .setHTML('This is a test.')
        //         .addTo(map);
        // })
    }

    if (map.loaded()) { addToMap() }
    else { map.on('load', function() { addToMap() }) }
}

module.exports = plotToMap;