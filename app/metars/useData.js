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

    map.addLayer({
        id: 'metarStations',
        type: 'circle',
        source: {
            type: 'geojson',
            data: geojsonTemplate,
        },
        'paint': {
            'circle-radius': 4,
            'circle-stroke-width': 3,
            'circle-color': '#12b317',
            'circle-stroke-color': '#0b610e',
        }
    });

    map.on('click', 'metarStations', (e) => {
        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;
        const id = e.features[0].properties.stationID;

        // https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=KDCA&hoursBeforeNow=1
        var stationDataURL = `https://tgftp.nws.noaa.gov/data/observations/metar/stations/${id}.TXT#`;
        var noCacheURL = ut.preventFileCaching(ut.phpProxy2 + stationDataURL);
        $.get(noCacheURL, function(data) {
            console.log(data)

            ut.spawnModal({
                'title': `Station ${id}`,
                'headerColor': 'alert-success',
                'body': data
            })
        })
    });
    map.on('mouseenter', 'metarStations', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'metarStations', () => {
        map.getCanvas().style.cursor = '';
    });
}

function toggleMETARStationMarkers(showHide) {
    if (showHide == 'hide') {
        map.setLayoutProperty('metarStations', 'visibility', 'none');
        //mapFuncs.removeMapLayer('tideStationDots');
    } else if (showHide == 'show') {
        map.setLayoutProperty('metarStations', 'visibility', 'visible');
    }
}

module.exports = {
    useData,
    toggleMETARStationMarkers
}