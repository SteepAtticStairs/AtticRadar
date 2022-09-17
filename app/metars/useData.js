var map = require('../radar/map/map');
const ut = require('../radar/utils');

var geojsonTemplate = {
    "type": "FeatureCollection",
    "features": []
}
function resetTemplate() {
    geojsonTemplate = {
        "type": "FeatureCollection",
        "features": []
    }
}

function useData(data, action) {
    resetTemplate();
    for (var item in data.response.data.METAR) {
        var lat = parseFloat(data.response.data.METAR[item].latitude['#text']);
        var lon = parseFloat(data.response.data.METAR[item].longitude['#text']);
        var stationId = data.response.data.METAR[item].station_id['#text'];
        var rawMetarText = data.response.data.METAR[item].raw_text['#text'];

        geojsonTemplate.features.push({
            'properties': {
                'stationID': stationId,
                'rawMetarText': rawMetarText
            },
            "geometry": {
                "type": "Point",
                "coordinates":
                    [lon, lat]
            }
        });
    }

    if (action == 'update') {
        console.log(geojsonTemplate)
        map.getSource('metarSymbolLayer').setData(geojsonTemplate);
        toggleMETARStationMarkers('show');
    } else if (action == 'load') {
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
            const rawText = e.features[0].properties.rawMetarText;

            ut.spawnModal({
                'title': `Station ${id}`,
                'headerColor': 'alert-success',
                'body': rawText
            })

            // // https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=KDCA&hoursBeforeNow=1
            // // `https://tgftp.nws.noaa.gov/data/observations/metar/stations/${id}.TXT#`
            // var stationDataURL = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${id}&hoursBeforeNow=1#`;
            // var noCacheURL = ut.preventFileCaching(ut.phpProxy2 + stationDataURL);
            // console.log(noCacheURL)
            // $.get(noCacheURL, function (data) {
            //     console.log(data)

            //     //ut.spawnModal({
            //     //    'title': `Station ${id}`,
            //     //    'headerColor': 'alert-success',
            //     //    'body': data
            //     //})
            // })
        });
        map.on('mouseenter', 'metarSymbolLayer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'metarSymbolLayer', () => {
            map.getCanvas().style.cursor = '';
        });
    }
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