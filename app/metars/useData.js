var map = require('../radar/map/map');
const ut = require('../radar/utils');

var geojsonTemplate = {
    "type": "FeatureCollection",
    "features": []
}

function useData(data) {
    for (var item in data.response.data.Station) {
        var lat = parseFloat(data.response.data.Station[item].latitude['#text']);
        var lon = parseFloat(data.response.data.Station[item].longitude['#text']);
        var stationId = data.response.data.Station[item].station_id['#text'];

        geojsonTemplate.features.push({
            'properties': {
                'stationID': stationId
            },
            "geometry": {
                "type": "Point",
                "coordinates":
                    [lon, lat]
            }
        });
    }

    // map.addLayer({
    //     id: 'metarStations',
    //     type: 'circle',
    //     source: {
    //         type: 'geojson',
    //         data: geojsonTemplate,
    //     },
    //     'paint': {
    //         'circle-radius': 4,
    //         'circle-stroke-width': 3,
    //         'circle-color': '#12b317',
    //         'circle-stroke-color': '#0b610e',
    //     }
    // });
    map.loadImage(
        'https://steepatticstairs.github.io/AtticRadar/resources/roundedRectangle.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker-metar', image, {
                "sdf": "true"
            });
            map.addSource('metarSymbolLayer', {
                'type': 'geojson',
                'generateId': true,
                'data': geojsonTemplate
            });

            // Add a symbol layer
            map.addLayer({
                'id': 'metarSymbolLayer',
                'type': 'symbol',
                'source': 'metarSymbolLayer',
                'layout': {
                    'icon-image': 'custom-marker-metar',
                    'icon-size': 0.07,
                    'text-field': ['get', 'stationID'],
                    'text-size': 13,
                    'text-font': [
                        //'Open Sans Semibold',
                        'Arial Unicode MS Bold'
                    ],
                    //'text-offset': [0, 1.25],
                    //'text-anchor': 'top'
                },
                'paint': {
                    //'text-color': 'white',
                    'text-color': 'black',
                    'icon-color': 'ForestGreen'
                }
            });
            map.moveLayer('stationSymbolLayer');
        }
    );

    map.on('click', 'metarSymbolLayer', (e) => {
        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;
        const id = e.features[0].properties.stationID;

        // https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=KDCA&hoursBeforeNow=1
        var stationDataURL = `https://tgftp.nws.noaa.gov/data/observations/metar/stations/${id}.TXT#`;
        var noCacheURL = ut.preventFileCaching(ut.phpProxy2 + stationDataURL);
        $.get(noCacheURL, function (data) {
            console.log(data)

            ut.spawnModal({
                'title': `Station ${id}`,
                'headerColor': 'alert-success',
                'body': data
            })
        })
    });
    map.on('mouseenter', 'metarSymbolLayer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'metarSymbolLayer', () => {
        map.getCanvas().style.cursor = '';
    });
}

function toggleMETARStationMarkers(showHide) {
    if (showHide == 'hide') {
        map.setLayoutProperty('metarSymbolLayer', 'visibility', 'none');
        //mapFuncs.removeMapLayer('tideStationDots');
    } else if (showHide == 'show') {
        map.setLayoutProperty('metarSymbolLayer', 'visibility', 'visible');
    }
}

module.exports = {
    useData,
    toggleMETARStationMarkers
}