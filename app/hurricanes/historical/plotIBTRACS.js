const ut = require('../../core/utils');
var map = require('../../radar/map/map');

// https://www.nrlmry.navy.mil/atcf_web/docs/database/new/abdeck.txt

function capitalizeFirstLetter(string) {
    string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
}
function printTime(dateObj, localOrNot) {
    var timeZ;
    if (localOrNot) {
        dateObj = convertUTCDateToLocalDate(dateObj);
        timeZ = new Date().toLocaleTimeString(undefined, {timeZoneName: 'short'}).split(' ')[2];
    } else {
        timeZ = 'UTC';
    }
    return `${dateObj.toLocaleDateString()} ${dateObj.getHours()}:${ut.zeroPad(dateObj.getMinutes())} ${timeZ}`;
}

var lineStringGeojson;
var pointGeojson;
function resetGeojsons() {
    lineStringGeojson = {
        "type": "LineString",
        "coordinates": []
    }
    pointGeojson = {
        "type": "FeatureCollection",
        "features": []
    }
}
resetGeojsons();

function pushNewLineString(coords) {
    lineStringGeojson.coordinates.push(coords);
}
function pushNewPoint(coords, properties) {
    var objToPush = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": coords
        },
        "properties": properties
    }
    pointGeojson.features.push(objToPush)
}

var layersArr = [];
function plot(pointGeojson, lineGeojson, stormID) {
    map.addLayer({
        'id': `haLayerLine${stormID}`,
        'type': 'line',
        'source': {
            type: 'geojson',
            data: lineGeojson,
        },
        'paint': {
            'line-color': '#ffffff',
            'line-width': 2
        }
    });
    layersArr.push(`haLayerLine${stormID}`)

    map.addSource(`haLayerPointsSource${stormID}`, {
        type: "geojson",
        data: pointGeojson
    });
    layersArr.push(`haLayerPointsSource${stormID}`)
    map.addLayer({
        "id": `haLayerPoints${stormID}`,
        "type": "circle",
        "source": `haLayerPointsSource${stormID}`,
        "paint": {
            "circle-radius": 9,
            'circle-stroke-width': 2,
            'circle-color': {
                type: 'identity',
                property: 'color',
            },
            'circle-stroke-color': {
                type: 'identity',
                property: 'color',
            },
        }
    });
    layersArr.push(`haLayerPoints${stormID}`)

    map.addLayer({
        "id": `haLayerPointsText${stormID}`,
        "type": "symbol",
        "source": `haLayerPointsSource${stormID}`,
        "layout": {
            "text-field": ['get', 'abbv'],
            "text-font": [
                "Arial Unicode MS Bold"
            ],
            "text-size": 14,
            //'text-allow-overlap': true,
            //'text-ignore-placement': true,
        }
    });
    layersArr.push(`haLayerPointsText${stormID}`)

    $('#dataDiv').data('haMapLayers', layersArr);
}

function parseHurricaneFile(hurricaneJSON, stormID) {
    // var theHaMarkerArr = $('#dataDiv').data('haMarkerArr')
    // for (var i in theHaMarkerArr) {
    //     theHaMarkerArr[i].remove()
    // }
    resetGeojsons();

    //var haMarkerArr = [];
    var json = hurricaneJSON;
    console.log(json)

    for (var i in json) {
        try {
            var lat = json[i].LAT;
            var lon = json[i].LON;
            var usaWind = json[i].USA_WIND;
            var wmoWind = json[i].WMO_WIND;

            if (usaWind == undefined) {
                usaWind = 'Unknown'
            } else {
                if (usaWind.replace(/ /g, '') == '') {
                    usaWind = 'Unknown'
                } else {
                    usaWind = ut.knotsToMph(usaWind, 0)
                }
            }
            var sshwsVal = ut.getSSHWSVal(usaWind);
            json[i].color = sshwsVal[1];
            json[i].abbv = sshwsVal[2];

            pushNewPoint([lon, lat], json[i]);
            pushNewLineString([lon, lat], json[i]);
            // var haMarker = new mapboxgl.Marker()
            //     .setLngLat([lon, lat])
            //     .addTo(map);
            // haMarkerArr.push(haMarker)
            if (parseInt(i) == Object.keys(json).length - 2) {
                //$('#dataDiv').data('haMarkerArr', haMarkerArr);
                //console.log(pointGeojson)
                plot(pointGeojson, lineStringGeojson, stormID)
            }
        } catch (e) {
            console.warn(e);
        }
    }

    map.on('mouseenter', `haLayerPoints${stormID}`, function (e) {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', `haLayerPoints${stormID}`, function (e) {
        map.getCanvas().style.cursor = '';
    });
    map.on('click', `haLayerPoints${stormID}`, function(e) {
        $('#haMapControlText').show();

        var properties = e.features[0].properties;
        console.log(properties);

        var divToAppend = 
        `<div><b>ID:</b> ${properties.SID}</div>
        <div><b>Name:</b> ${capitalizeFirstLetter(properties.NAME)}</div>
        <div><b>Wind Speed:</b> ${parseInt(ut.knotsToMph(parseFloat(properties.USA_WIND)))} mph</div>
        <div><b>Pressure:</b> ${properties.USA_PRES} mb</div>
        <div>${printTime(new Date(properties.ISO_TIME), false)}</div>`

        document.getElementById('haMapControlText').innerHTML = divToAppend;
    })
}

module.exports = parseHurricaneFile;