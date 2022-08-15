var map = require('../radar/map/map');
const drawChart = require('./chart');
const fetchData = require('./fetchData');
const mapFuncs = require('../radar/map/mapFunctions');

var geojsonTemplate = {
    "type": "FeatureCollection",
    "features": []
}

function loadTideStationMarkers(divName) {
    var allStationsURL = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions';
    $.getJSON(allStationsURL, function(data) {
        for (var i = 0; i < data.stations.length; i++) {
            var tideStationLat = data.stations[i].lat;
            var tideStationLng = data.stations[i].lng;
            var tideStationName = data.stations[i].name;
            var tideStationID = data.stations[i].id;

            var popupContent = `
            <div id='tideStationPopup'>
                <div>
                    <b>
                        ${tideStationName}
                    </b>
                </div>
                <div>
                    ${tideStationID}
                </div>
            </div>`

            // var tideStationMarker = new mapboxgl.Marker({
            //     color: "#4287f5",
            // }).setLngLat([tideStationLng, tideStationLat])
            //     .setPopup(new mapboxgl.Popup().setHTML(popupContent))
            //     .addTo(map);
            geojsonTemplate.features.push({
                'properties': {
                    'stationName': tideStationName,
                    'stationID': tideStationID,
                    'description': popupContent
                },
                "geometry": {
                    "type": "Point",
                    "coordinates":
                        [tideStationLng, tideStationLat]
                }
            });
        }
        map.addLayer({
            id: 'tideStationDots',
            type: 'circle',
            source: {
                type: 'geojson',
                data: geojsonTemplate,
            },
            'paint': {
                'circle-radius': 4,
                'circle-stroke-width': 3,
                'circle-color': '#4287f5',
                'circle-stroke-color': '#002b70',
            }
        });

        map.on('click', 'tideStationDots', (e) => {
            // Copy coordinates array.
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;
            const name = e.features[0].properties.stationName;
            const id = e.features[0].properties.stationID;

            // new mapboxgl.Popup()
            // .setLngLat(coordinates)
            // .setHTML(description)
            // .addTo(map);
            console.log(name)
            document.getElementById('exampleModalLabel').innerHTML = `${name} [${id}]`;
            fetchData(id, function(tideHeightArr) {
                drawChart(divName, tideHeightArr);
            })
        });
    })
    map.on('mouseenter', 'tideStationDots', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'tideStationDots', () => {
        map.getCanvas().style.cursor = '';
    });
}

function toggleTideStationMarkers(showHide) {
    if (showHide == 'hide') {
        map.setLayoutProperty('tideStationDots', 'visibility', 'none');
        //mapFuncs.removeMapLayer('tideStationDots');
    } else if (showHide == 'show') {
        map.setLayoutProperty('tideStationDots', 'visibility', 'visible');
    }
}

module.exports = {
    loadTideStationMarkers,
    toggleTideStationMarkers
};