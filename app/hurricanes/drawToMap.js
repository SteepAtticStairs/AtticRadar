const ut = require('../radar/utils');
var map = require('../radar/map/map');

function drawHurricanesToMap(geojson, type, index) {
    map.on('load', () => {
        if (type == 'cone') {
            map.addLayer({
                'id': `coneLayer${index}`,
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
                'id': `coneLayerOutline${index}`,
                'type': 'line',
                'source': `coneLayer${index}`,
                'paint': {
                    //#014385 blue
                    //#850101 red
                    'line-color': '#014385',
                    'line-width': 3
                }
            });
        } else if (type == 'track') {
            map.addLayer({
                'id': `trackLayerLine${index}`,
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
                'id': `trackLayerPoints${index}`,
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

        map.on('mouseenter', `trackLayerPoints${index}`, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', `trackLayerPoints${index}`, () => { map.getCanvas().style.cursor = ''; });

        map.on('click', `trackLayerPoints${index}`, function(e) {
            // parse the content of each point
            var div = document.createElement('div')
            div.innerHTML = e.features[0].properties.description;
            var parsedDescription = JSON.parse(ut.html2json(div));

            var trackpointStormName = parsedDescription.children[0].children[0].children[0].textContent;
            var trackpointAdvisoryNum = parsedDescription.children[0].children[0].children[1].textContent;
            var trackpointForecastDesc = parsedDescription.children[0].children[0].children[3].textContent;
            var trackpointTime = parsedDescription.children[0].children[0].children[4].textContent;
            var trackpointLocation = parsedDescription.children[0].children[0].children[5].textContent;
            var trackpointMaxWind = parsedDescription.children[0].children[0].children[6].textContent;
            var trackpointWindGusts = parsedDescription.children[0].children[0].children[7].textContent;
            var trackpointMotion;
            var trackpointPressure;
            if (parsedDescription.children[0].children[0].children.hasOwnProperty(8)) {
                trackpointMotion = parsedDescription.children[0].children[0].children[8].textContent;
            }
            if (parsedDescription.children[0].children[0].children.hasOwnProperty(9)) {
                trackpointPressure = parsedDescription.children[0].children[0].children[9].textContent;
            }

            var popupContent = 
            `<div>
                <div><b>${trackpointStormName}</b></div>
                <br>
                <div>${trackpointTime}</div>
                <div>${trackpointLocation}</div>
                <div>${trackpointMaxWind}</div>
                <div>${trackpointWindGusts}</div>`

            if (trackpointMotion != undefined && trackpointPressure != undefined) {
                popupContent += `<br>`
            }
            if (trackpointMotion != undefined) {
                popupContent += `<div>${trackpointMotion}</div>`
            }
            if (trackpointPressure != undefined) {
                popupContent += `<div>${trackpointPressure}</div>`
            }

            popupContent += '</div>';

            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                //.setHTML(e.features[0].properties.description)
                .addTo(map);
        })

        var namesArr = $('#dataDiv').data('allHurricanesPlotted');
        // increase the counter of number of layers plotted
        var indexOfDrawnHurricane = $('#dataDiv').data('indexOfDrawnHurricane');
        indexOfDrawnHurricane.push(index);
        $('#dataDiv').data('indexOfDrawnHurricane', indexOfDrawnHurricane);

        if (indexOfDrawnHurricane.length == namesArr.length * 2) {
            for (var i = 0; i < namesArr.length * 2; i++) {
                // set layer order
                if (map.getLayer(`trackLayerLine${i}`)) {
                    map.moveLayer(`trackLayerLine${i}`)
                }
                if (map.getLayer(`trackLayerPoints${i}`)) {
                    map.moveLayer(`trackLayerPoints${i}`)
                }
            }
        }
    })
}

module.exports = drawHurricanesToMap;