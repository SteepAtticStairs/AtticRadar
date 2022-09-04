const ut = require('../radar/utils');
var map = require('../radar/map/map');

function drawHurricanesToMap(geojson, type, index, hurricaneID) {
    console.log(`${hurricaneID}/${type} - Drawing hurricane to map...`);
    function doTheStuff() {
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

            var hurricaneMapLayers = $('#dataDiv').data('hurricaneMapLayers');
            hurricaneMapLayers.push(`coneLayer${index}`);
            hurricaneMapLayers.push(`coneLayerOutline${index}`);
            $('#dataDiv').data('hurricaneMapLayers', hurricaneMapLayers);
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

            var hurricaneMapLayers = $('#dataDiv').data('hurricaneMapLayers');
            hurricaneMapLayers.push(`trackLayerLine${index}`);
            hurricaneMapLayers.push(`trackLayerPoints${index}`);
            $('#dataDiv').data('hurricaneMapLayers', hurricaneMapLayers);
        }

        map.on('mouseenter', `trackLayerPoints${index}`, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', `trackLayerPoints${index}`, () => { map.getCanvas().style.cursor = ''; });

        map.on('click', `trackLayerPoints${index}`, function(e) {
            // parse the content of each point
            var div = document.createElement('div')
            div.innerHTML = e.features[0].properties.description;
            var parsedDescription = JSON.parse(ut.html2json(div));

            console.log(e.features[0].properties.styleUrl)
            // #xs_point = Extratropical Cyclone
            // #h_point = Hurricane
            // #s_point = Tropical Storm
            // #xd_point = Low Pressure Area OR Tropical Depression?

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

            // gets text in between parentheses, e.g. "70 mph" and removes the last 4 characters
            // https://stackoverflow.com/a/12059321/18758797
            var windSpeedMPH = trackpointMaxWind.match(/\(([^)]+)\)/)[1].slice(0, -4);
            var sshwsLevel = ut.getSSHWSVal(windSpeedMPH);

            var popupContent = 
            `<div>
                <div><b>${trackpointStormName}</b></div>
                <div><u>SSHWS: ${sshwsLevel}</u></div>
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
        //console.log(`${hurricaneID}/${type} - Finished drawing hurricane.`);

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
            console.log(`Finished drawing all hurricanes.`);

            // add the hurricanes menu item
            require('./menuItem').loadHurricanesControl($('#dataDiv').data('hurricaneMapLayers'));
        }
    }
    doTheStuff();
}

module.exports = drawHurricanesToMap;