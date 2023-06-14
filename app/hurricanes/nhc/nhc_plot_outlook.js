const kmz_to_geojson = require('../kmz_to_geojson');
const map = require('../../core/map/map');

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

    var percentage_html = '';
    if (properties.hasOwnProperty('2day_percentage')) {
        percentage_html += `<div style="font-size: 20px; text-align: center">2-day: <b>${properties['2day_percentage']}%</b></div>`;
    }
    if (properties.hasOwnProperty('5day_percentage')) {
        percentage_html += `<div style="font-size: 20px; text-align: center">2]5-day: <b>${properties['5day_percentage']}%</b></div>`;
    }
    if (properties.hasOwnProperty('7day_percentage')) {
        percentage_html += `<div style="font-size: 20px; text-align: center">7-day: <b>${properties['7day_percentage']}%</b></div>`;
    }

    var popupContent =
        `<div style="overflow-y: scroll; max-height: 150px; color: white">
            ${percentage_html}
            <br>
            <div>Disturbance <b>#${properties.Disturbance}</b></div>
            <div><b>Discussion:</b></div>
            <div class="code">${properties.Discussion}</div>
        </div>`

    new mapboxgl.Popup({ className: 'alertPopup'})
        .setLngLat([lng, lat])
        .setHTML(popupContent)
        //.setHTML(e.features[0].properties.description)
        .addTo(map);
}

function nhc_plot_outlook(kmz_blob, id) {
    kmz_to_geojson(kmz_blob, (geojson) => {
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
                    'id': `outlookCone${id}${x}`,
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
                    'id': `outlookConeOutline${id}${x}`,
                    'type': 'line',
                    'source': `outlookCone${id}${x}`,
                    'paint': {
                        //#014385 blue
                        //#850101 red
                        'line-color': borderColor,
                        'line-width': borderWidth
                    }
                });
                window.atticData.hurricane_layers.push(`outlookCone${id}${x}`, `outlookConeOutline${id}${x}`);

                map.on('mouseenter', `outlookCone${id}${x}`, function (e) { map.getCanvas().style.cursor = 'pointer'; })
                map.on('mouseleave', `outlookCone${id}${x}`, function (e) { map.getCanvas().style.cursor = ''; })
                map.on('click', `outlookCone${id}${x}`, function(e) { showPopup(e, 'click') });
            } else if (type == 'Point') {
                if (curFeature.properties.name == undefined) curFeature.properties.name = '';
                if (!(curFeature.properties.name.includes('Tropical cyclone formation is not expected')) && !(curFeature.properties.name.includes('during the next'))) {
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

                    map.addSource(`outlookPointSource${id}${x}`, {
                        type: 'geojson',
                        data: curFeature
                    });
                    map.addLayer({
                        'id': `outlookPoint${id}${x}`,
                        'type': 'circle',
                        'source': `outlookPointSource${id}${x}`,
                        'paint': {
                            'circle-radius': 9,
                            'circle-stroke-width': 2,
                            'circle-color': ['get', 'color'],
                            'circle-stroke-color': black,
                        }
                    });
                    window.atticData.hurricane_layers.push(`outlookPoint${id}${x}`, `outlookConeOutline${id}${x}`);
                }
            }
        }
    })
}

module.exports = nhc_plot_outlook;