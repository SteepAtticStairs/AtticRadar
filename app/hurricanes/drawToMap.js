const ut = require('../radar/utils');
var map = require('../radar/map/map');
const { DateTime } = require('luxon');
const createCssClasses = require('./createCssClasses');
const isMobile = require('../radar/misc/detectmobilebrowser');
const stormTypeData = require('./stormTypeData');

createCssClasses.createCssClasses();

function getTrackPointData(properties) {
    var trackPointDataObj = {};
    // parse the content of each point
    var div = document.createElement('div')
    div.innerHTML = properties.description;
    var parsedDescription = JSON.parse(ut.html2json(div));

    //console.log(properties.styleUrl)
    // #xs_point = Extratropical Cyclone
    // #h_point = Hurricane
    // #s_point = Tropical Storm
    // #xd_point = Low Pressure Area OR Tropical Depression?

    trackPointDataObj.trackpointStormName = parsedDescription.children[0].children[0].children[0].textContent;
    trackPointDataObj.trackpointAdvisoryNum = parsedDescription.children[0].children[0].children[1].textContent;
    trackPointDataObj.trackpointForecastDesc = parsedDescription.children[0].children[0].children[3].textContent;
    trackPointDataObj.trackpointTime = parsedDescription.children[0].children[0].children[4].textContent;
    trackPointDataObj.trackpointLocation = parsedDescription.children[0].children[0].children[5].textContent;
    trackPointDataObj.trackpointMaxWind = parsedDescription.children[0].children[0].children[6].textContent;
    trackPointDataObj.trackpointWindGusts = parsedDescription.children[0].children[0].children[7].textContent;
    trackPointDataObj.trackpointMotion = undefined;
    trackPointDataObj.trackpointPressure = undefined;
    if (parsedDescription.children[0].children[0].children.hasOwnProperty(8)) {
        trackPointDataObj.trackpointMotion = parsedDescription.children[0].children[0].children[8].textContent;
    }
    if (parsedDescription.children[0].children[0].children.hasOwnProperty(9)) {
        trackPointDataObj.trackpointPressure = parsedDescription.children[0].children[0].children[9].textContent;
    }

    var forecastHourString = parsedDescription.children[0].children[0].children[3].textContent;
    var forecastHour = parseInt(forecastHourString);
    if (!Number.isNaN(forecastHour)) {
        trackPointDataObj.forecastHour = forecastHour;
    } else {
        trackPointDataObj.forecastHour = 0;
    }

    // gets text in between parentheses, e.g. "70 mph" and removes the last 4 characters
    // https://stackoverflow.com/a/12059321/18758797
    trackPointDataObj.windSpeedMPH = trackPointDataObj.trackpointMaxWind.match(/\(([^)]+)\)/)[1].slice(0, -4);
    trackPointDataObj.sshwsLevel = ut.getSSHWSVal(trackPointDataObj.windSpeedMPH);


    var formattedCoords = trackPointDataObj.trackpointLocation.replace('Location: ', '');
    // remove all spaces
    formattedCoords = formattedCoords.replace(/ /g, '');
    // remove N, S, E, and W
    formattedCoords = formattedCoords.replace(/N/g, '').replace(/S/g, '').replace(/E/g, '').replace(/W/g, '');
    // transform into lat, lng array by splitting at the comma
    formattedCoords = formattedCoords.split(',');
    trackPointDataObj.formattedCoords = formattedCoords;

    var formattedDateObj = DateTime.now().setZone("UTC");
    // 12:00 PM GMT September 05, 2022 
    // ["12:00", "AM", "GMT", "September", "09", "2022"]
    //  3:00 AM GMT September 05, 2022 
    // ["3:00", "AM", "GMT", "September", "09", "2022"]
    var formattedDate = trackPointDataObj.trackpointTime.replace('Valid at: ', '');
    if (formattedDate.charAt(0) == ' ') {
        formattedDate = '0' + formattedDate.substring(1);
    }
    if (formattedDate.charAt(formattedDate.length - 1) == ' ') {
        formattedDate = formattedDate.slice(0, -1);
    }
    //console.log(formattedDate)
    var tz = formattedDate.substring(9, 12);
    formattedDate = formattedDate.substring(0, 9) + formattedDate.substring(13);
    formattedDateObj = DateTime.fromFormat(formattedDate, "hh:mm a LLLL dd, yyyy");

    var finalDateObj = new Date(formattedDateObj.toUTC().ts);
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    //console.log(`${new Date(formattedDateObj.toUTC().ts).toLocaleString().replace(/,/g, '')} ${tz}`)
    var dayName = days[finalDateObj.getDay()];

    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var monthName = months[finalDateObj.getMonth()];

    var day = finalDateObj.getDate();

    var hourMin = ut.printHourMin(finalDateObj);

    // e.g. ["Tue", "3:00 PM", "MDT", vanilla js date obj]
    trackPointDataObj.formattedTime = [dayName, hourMin, tz, monthName, day, finalDateObj];

    return trackPointDataObj;
}

function drawHurricanesToMap(geojson, type, index, hurricaneID) {
    console.log(`${hurricaneID}/${type} - Drawing hurricane to map...`);

    var hurricaneTypeData = $('#dataDiv').data(`${hurricaneID}_hurricaneTypeData`);

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
            for (var item in geojson.features) {
                if (!geojson.features[item].properties.styleUrl.includes('line')) {
                    var trackPointData = getTrackPointData(geojson.features[item].properties);
                    var sshwsLevel = trackPointData.sshwsLevel;

                    geojson.features[item].properties.sshwsVal = sshwsLevel[0];
                    geojson.features[item].properties.sshwsValAbbv = sshwsLevel[2];
                    geojson.features[item].properties.sshwsColor = sshwsLevel[1];
                    var hurricaneType = hurricaneTypeData[trackPointData.forecastHour];
                    var normalTypes = ['TD', 'TS', 'HU', 'TY', 'ST', 'TC']
                    if (!normalTypes.includes(hurricaneType)) {
                        geojson.features[item].properties.sshwsColor = ut.sshwsValues[7][1];
                    }
                    //geojson.features[item].properties.coords = trackPointData.formattedCoords;
                }
            }
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
            map.addSource(`trackLayerPoints${index}`, {
                type: "geojson",
                data: geojson
            });
            map.addLayer({
                "id": `trackLayerPoints${index}`,
                "type": "circle",
                "source": `trackLayerPoints${index}`,
                "paint": {
                    "circle-radius": 9,
                    'circle-stroke-width': 2,
                    'circle-color': {
                        type: 'identity',
                        property: 'sshwsColor',
                    },
                    'circle-stroke-color': {
                        type: 'identity',
                        property: 'sshwsColor',
                    },
                }
            });
            map.addLayer({
                "id": `trackLayerPointsLabel${index}`,
                "type": "symbol",
                "source": `trackLayerPoints${index}`,
                "layout": {
                    "text-field": ['get', 'sshwsValAbbv'],
                    "text-font": [
                        "Arial Unicode MS Bold"
                    ],
                    "text-size": 14,
                    'text-allow-overlap': true,
                    'text-ignore-placement': true,
                }
            });

            var hurricaneMapLayers = $('#dataDiv').data('hurricaneMapLayers');
            hurricaneMapLayers.push(`trackLayerLine${index}`);
            hurricaneMapLayers.push(`trackLayerPoints${index}`);
            hurricaneMapLayers.push(`trackLayerPointsLabel${index}`);
            $('#dataDiv').data('hurricaneMapLayers', hurricaneMapLayers);
        }

        if (!isMobile) {
            var popupArr = [];
            map.on('mouseenter', `trackLayerPoints${index}`, function (e) {
                map.getCanvas().style.cursor = 'pointer';

                var obj = getTrackPointData(e.features[0].properties);
                //var hurricaneTypeData = $('#dataDiv').data(`${hurricaneID}_hurricaneTypeData`)
                //var fullHurricaneData = $('#dataDiv').data(`${hurricaneID}_hurricaneData`);
                var time = obj.formattedTime;

                var popupContent =
                    `<div>
                    <div><b>${time[0].substring(0, 3)} ${time[3].substring(0, 3)} ${time[4]}</b></div>
                    <div><b>${time[1]} ${time[2]}</b></div>
                    <!-- <div><b>${obj.trackpointTime}</b></div>
                    <br> -->
                    <div>${obj.sshwsLevel[0]}</div>
                    <div><b>${obj.windSpeedMPH}</b> mph wind</div>
                    <!-- <div><b>Storm Type:</b> ${'hurricaneTypeData[obj.forecastHour]'}</div> -->
                </div>`

                var pop = new mapboxgl.Popup({ className: obj.sshwsLevel[2] })
                    .setLngLat([obj.formattedCoords[1], obj.formattedCoords[0]])
                    .setHTML(popupContent)
                    //.setHTML(e.features[0].properties.description)
                    .addTo(map);
                popupArr.push(pop);
            });
            map.on('mouseleave', `trackLayerPoints${index}`, function (e) {
                map.getCanvas().style.cursor = '';

                setTimeout(function () {
                    for (var item in popupArr) {
                        popupArr[item].remove();
                    }
                }, 50)
            });
        }

        map.on('click', `trackLayerPoints${index}`, function (e) {
            var obj = getTrackPointData(e.features[0].properties);
            var hurricaneType = hurricaneTypeData[obj.forecastHour];

            var popupContent =
                `<div>
                <div><b>${obj.trackpointStormName}</b></div>
                <div><u>SSHWS: ${obj.sshwsLevel[0]}</u></div>
                <br>
                <div>${obj.trackpointTime}</div>
                <div>${obj.trackpointLocation}</div>
                <div>${obj.trackpointMaxWind}</div>
                <div>${obj.trackpointWindGusts}</div>
                <div><b>Storm Type:</b> ${ut.hurricaneTypesAbbvs[hurricaneType]} (${hurricaneType})</div>`

            if (obj.trackpointMotion != undefined && obj.trackpointPressure != undefined) {
                popupContent += `<br>`
            }
            if (obj.trackpointMotion != undefined) {
                popupContent += `<div>${obj.trackpointMotion}</div>`
            }
            if (obj.trackpointPressure != undefined) {
                popupContent += `<div>${obj.trackpointPressure}</div>`
            }

            popupContent += '</div>';

            new mapboxgl.Popup()
                .setLngLat([obj.formattedCoords[1], obj.formattedCoords[0]])
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
                if (map.getLayer(`trackLayerPointsLabel${i}`)) {
                    map.moveLayer(`trackLayerPointsLabel${i}`)
                }
            }
            console.log(`Finished drawing all hurricanes.`);

            // add the hurricanes menu item
            //require('./menuItem').loadHurricanesControl($('#dataDiv').data('hurricaneMapLayers'));
        }
    }
    doTheStuff();
}

module.exports = drawHurricanesToMap;