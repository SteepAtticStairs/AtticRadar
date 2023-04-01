const turf = require('@turf/turf');
const map = require('../radar/map/map');
const url = `https://attic-server.herokuapp.com/proxy/index.php/?http://placefilenation.com/Placefiles/20lightning.php`;

fetch(url, {
    headers: {
        'User-Agent': 'GR2Analyst'
    }
})
.then(response => response.text())
.then(data => {
    data = data.split('\n');

    var points = [];
    for (var i in data) {
        var row = data[i];
        if (row.startsWith('Icon:')) {
            row = row.replace('Icon: ', '');
            row = row.split(',');

            var lat = parseFloat(row[0]);
            var lng = parseFloat(row[1]);
            var description = row[5];
            points.push(turf.point([lng, lat], {desc: description}));
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
            'circle-stroke-width': 2,
            'circle-color': 'red',
            'circle-stroke-color': 'white'
        }
    });
})
.catch(error => {
    console.error(error);
});