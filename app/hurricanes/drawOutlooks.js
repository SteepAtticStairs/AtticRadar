const ut = require('../radar/utils');
var map = require('../radar/map/map');

function showPopup(e, coordsFromFeatureOrClick) {
    var lat;
    var lng;
    if (coordsFromFeatureOrClick == 'feature') {
        lng = e.features[0].geometry.coordinates[0];
        lat = e.features[0].geometry.coordinates[1];
    } else if (coordsFromFeatureOrClick == 'click') {
        lng = e.lngLat.lng;
        lat = e.lngLat.lat;
    }
    var properties = e.features[0].properties;

    var popupContent =
        `<div style="overflow-y: scroll; max-height: 150px;">
            <div style="font-size: 20px; text-align: center">2-day: <b>${properties['2day_percentage']}%</b></div>
            <div style="font-size: 20px; text-align: center">5-day: <b>${properties['5day_percentage']}%</b></div>
            <br>
            <div>Disturbance <b>#${properties.Disturbance}</b></div>
            <div><b>Discussion:</b></div>
            <div class="code">${properties.Discussion}</div>
        </div>`

    new mapboxgl.Popup()
        .setLngLat([lng, lat])
        .setHTML(popupContent)
        //.setHTML(e.features[0].properties.description)
        .addTo(map);
}

function drawOutlookToMap(geojson, name) {
    console.log(geojson)
    var hurricaneMapLayers = $('#dataDiv').data('hurricaneMapLayers');

    for (var x = 0; x < geojson.features.length; x++) {
        var curFeature = geojson.features[x];
        var type = curFeature.geometry.type;
        if (type == 'Polygon') {
            var fillColor = curFeature.properties.fill;
            var fillOpacity = curFeature.properties['fill-opacity'];
            var borderColor = curFeature.properties.stroke;
            var borderWidth = curFeature.properties['stroke-width'];
            var coneCoordinates = curFeature.geometry.coordinates[0];
            curFeature.geometry.coordinates[0].push(coneCoordinates[0]);

            map.addLayer({
                'id': `outlookCone${name}${x}`,
                'type': 'fill',
                'source': {
                    type: 'geojson',
                    data: curFeature,
                },
                paint: {
                    //#0080ff blue
                    //#ff7d7d red
                    'fill-color': fillColor,
                    'fill-opacity': 0.3
                }
            });
            map.addLayer({
                'id': `outlookConeOutline${name}${x}`,
                'type': 'line',
                'source': `outlookCone${name}${x}`,
                'paint': {
                    //#014385 blue
                    //#850101 red
                    'line-color': borderColor,
                    'line-width': borderWidth
                }
            });
            hurricaneMapLayers.push(`outlookCone${name}${x}`);
            hurricaneMapLayers.push(`outlookConeOutline${name}${x}`);

            map.on('mouseenter', `outlookCone${name}${x}`, function (e) { map.getCanvas().style.cursor = 'pointer'; })
            map.on('mouseleave', `outlookCone${name}${x}`, function (e) { map.getCanvas().style.cursor = ''; })
            map.on('click', `outlookCone${name}${x}`, function(e) { showPopup(e, 'click') });
        } else if (type == 'Point') {
            if (curFeature.properties.name != " Tropical cyclone formation is not expected " && curFeature.properties.name != " during the next 5 days. ") {
                var black = 'rgb(0, 0, 0)';
                var highColor = 'rgb(214, 46, 31)'; // red
                var mediumColor = 'rgb(240, 151, 55)'; // orange
                var lowColor = 'rgb(255, 255, 84)'; // yellow

                if (curFeature.properties.styleUrl == '#highx') {
                    curFeature.properties.color = highColor;
                } else if (curFeature.properties.styleUrl == '#medx') {
                    curFeature.properties.color = mediumColor;
                } else if (curFeature.properties.styleUrl == '#lowx') {
                    curFeature.properties.color = lowColor;
                } else {
                    curFeature.properties.color = highColor;
                }

                map.addSource(`outlookPointSource${name}${x}`, {
                    type: "geojson",
                    data: curFeature
                });
                map.addLayer({
                    "id": `outlookPoint${name}${x}`,
                    "type": "circle",
                    "source": `outlookPointSource${name}${x}`,
                    "paint": {
                        "circle-radius": 9,
                        'circle-stroke-width': 2,
                        'circle-color': ['get', 'color'],
                        'circle-stroke-color': black,
                    }
                });
                hurricaneMapLayers.push(`outlookPoint${name}${x}`);
            }
            // map.on('mouseenter', `outlookPoint${name}${x}`, function (e) { map.getCanvas().style.cursor = 'pointer'; })
            // map.on('mouseleave', `outlookPoint${name}${x}`, function (e) { map.getCanvas().style.cursor = ''; })
            // map.on('click', `outlookPoint${name}${x}`, function(e) { showPopup(e, 'feature') });
        }/* else if (type == 'LineString') {
            if (curFeature.properties.name != " Tropical cyclone formation is not expected " && curFeature.properties.name != " during the next 5 days. ") {
                var green = 'rgb(0, 200, 0)';

                map.addSource(`outlookLineSource${name}${x}`, {
                    type: "geojson",
                    data: curFeature
                });
                map.addLayer({
                    "id": `outlookLine${name}${x}`,
                    "type": "line",
                    "source": `outlookLineSource${name}${x}`,
                    "paint": {
                        'line-color': green,
                        'line-width': 4
                    }
                });
                hurricaneMapLayers.push(`outlookLine${name}${x}`);
            }
            // map.on('mouseenter', `outlookPoint${name}${x}`, function (e) { map.getCanvas().style.cursor = 'pointer'; })
            // map.on('mouseleave', `outlookPoint${name}${x}`, function (e) { map.getCanvas().style.cursor = ''; })
            // map.on('click', `outlookPoint${name}${x}`, function(e) { showPopup(e, 'feature') });
        }*/
        $('#dataDiv').data('hurricaneMapLayers', hurricaneMapLayers);
    }
}

module.exports = drawOutlookToMap;