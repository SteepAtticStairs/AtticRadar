const fetchPolygonData = require('./fetchData');
const ut = require('../radar/utils');
const createMenuOption = require('../radar/menu/createMenuOption');
const mapClick = require ('./mapClick');
const getPolygonColors = require('./polygonColors');
const simplify = require('simplify-geojson')
var geojsonMerge = require('@mapbox/geojson-merge');
var map = require('../radar/map/map');

// https://stackoverflow.com/a/1431113/18758797
function replaceAt(str, index, replacement) {
    return str.substring(0, index) + replacement + str.substring(index + replacement.length);
}

var totalLoaded = 2000000; // 2 MB (to account for the alert file fetched from api.weather.gov)

function addScriptTag(url, cb) {
    // var s = document.createElement("script");
    // s.type = "text/javascript";
    // s.src = url;
    // $("head").append(s);
    // cb();
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.addEventListener('load', function () {
        var response = xhr.response;

        var s = document.createElement("script");
        s.type = "text/javascript";
        s.innerHTML = response;
        $("head").append(s);

        cb();
    });
    xhr.onprogress = (event) => {
        // event.loaded returns how many bytes are downloaded
        // event.total returns the total number of bytes
        // event.total is only available if server sends `Content-Length` header
        //console.log(`%c Downloaded ${ut.formatBytes(event.loaded)} of ${ut.formatBytes(event.total)}`, 'color: #bada55');
        //var complete = (event.loaded / event.total * 50 | 0);
        console.log(`${ut.formatBytes(event.loaded)}`);
        //ut.progressBarVal('label', ut.formatBytes(event.loaded));
        var thingToLoad = totalLoaded + parseFloat(event.loaded)/* / 31000000*/;
        ut.betterProgressBar('set', ut.scale(thingToLoad, 0, 33000000, 0, 100)); // scale from 31 MB (all of the alert zones + the extra 2 MB)
    }
    xhr.send();
}

function addAlertGeojsonLayer(layerName, geojson) {
    map.addSource(`${layerName}Source`, {
        type: 'geojson',
        data: geojson,
    })
    map.addLayer({
        'id': `${layerName}LayerFill`,
        'type': 'fill',
        'source': `${layerName}Source`,
        paint: {
            //#0080ff blue
            //#ff7d7d red
            'fill-color': ['get', 'color'],
            'fill-opacity': 0
        }
    }, 'stationSymbolLayer');
    map.addLayer({
        'id': `${layerName}LayerOutline`,
        'type': 'line',
        'source': `${layerName}Source`,
        'paint': {
            //#014385 blue
            //#850101 red
            'line-color': 'black',
            'line-width': 8
        }
    }, 'stationSymbolLayer');
    map.addLayer({
        'id': `${layerName}Layer`,
        'type': 'line',
        'source': `${layerName}Source`,
        'paint': {
            //#014385 blue
            //#850101 red
            'line-color': ['get', 'color'],
            'line-width': 3
        }
    }, 'stationSymbolLayer');

    map.on('mouseover', `${layerName}LayerFill`, function(e) {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseout', `${layerName}LayerFill`, function(e) {
        map.getCanvas().style.cursor = '';
    });

    map.on('click', `${layerName}LayerFill`, mapClick)
}

var newAlertsURL = `${ut.phpProxy}https://preview.weather.gov/edd/resource/edd/hazards/getShortFusedHazards.php?all=true`;
var swsAlertsURL = `${ut.phpProxy}https://preview.weather.gov/edd/resource/edd/hazards/getSps.php`;
// https://realearth.ssec.wisc.edu/products/?app=_ALL_
var allAlertsURL = `https://realearth.ssec.wisc.edu/api/shapes?products=NWS-Alerts-All`;
var noaaAlertsURL = `https://api.weather.gov/alerts/active`;
var newAlertsArr = [];
var y = 0;

createMenuOption({
    'divId': 'alertMenuItemDiv',
    'iconId': 'alertMenuItemIcon',

    'divClass': 'mapFooterMenuItem',
    'iconClass': 'icon-grey',

    'contents': 'Show Alerts',
    'icon': 'fa fa-circle-exclamation',
    'css': ''
}, function(divElem, iconElem) {
    if (!$(iconElem).hasClass('icon-blue')) {
        $(iconElem).addClass('icon-blue');
        $(iconElem).removeClass('icon-grey');

        if (map.getLayer('mainAlertsLayer')) {
            //map.getCanvas().style.cursor = "crosshair";
            map.on('click', 'mainAlertsLayerFill', mapClick);

            map.setLayoutProperty('mainAlertsLayer', 'visibility', 'visible');
            map.setLayoutProperty('mainAlertsLayerFill', 'visibility', 'visible');
            map.setLayoutProperty('mainAlertsLayerOutline', 'visibility', 'visible');
        } else {
            ut.betterProgressBar('show');
            ut.betterProgressBar('set', 0);

            // '../data/active.json'
            // noaaAlertsURL
            fetchPolygonData([noaaAlertsURL], function(data) {
                for (var item in data.features) {
                    data.features[item].properties.color = getPolygonColors(data.features[item].properties.event);
                }
                console.log(data)

                addAlertGeojsonLayer('mainAlerts', data);

                function loadExtraAlerts() {
                    setTimeout(function() {
                        //map.getCanvas().style.cursor = "crosshair";
                        //map.on('click', 'newAlertsLayer', mapClick)

                        var host = window.location.host;
                        var urlPart;
                        if (!host.includes(':')) {
                            urlPart = 'https://steepatticstairs.github.io/AtticRadar/';
                        } else {
                            urlPart = '../';
                        }
                        console.log(host)

                        addScriptTag(`${urlPart}app/alerts/alertZones/forecastZones.js`, function() {
                        console.log('Loaded forecast zones.');
                        totalLoaded = totalLoaded + 14500000; // 14.5 MB
                        addScriptTag(`${urlPart}app/alerts/alertZones/countyZones.js`, function() {
                        console.log('Loaded county zones.');
                        totalLoaded = totalLoaded + 7500000; // 7.5 MB
                        addScriptTag(`${urlPart}app/alerts/alertZones/fireZones.js`, function() {
                        console.log('Loaded fire zones.');
                        totalLoaded = totalLoaded + 8900000; // 8.8 MB

                        ut.betterProgressBar('set', 100);
                        setTimeout(function() {
                            ut.betterProgressBar('hide');
                        }, 500)

                        var polygonGeojson = {
                            "type": "FeatureCollection",
                            "features": []
                        }
                        function pushNewPolygon(geometry, properties) {
                            // this allows you to add properties for each cell
                            var objToPush = {
                                "type": "Feature",
                                "geometry": geometry,
                                "properties": properties
                            }
                            polygonGeojson.features.push(objToPush)
                        }
                        for (var item in data.features) {
                            if (data.features[item].geometry == null) {
                                var affectedZones = data.features[item].properties.affectedZones;
                                for (var i in affectedZones) {
                                    var zoneToPush;
                                    if (affectedZones[i].includes('forecast')) {
                                        affectedZones[i] = affectedZones[i].replace('https://api.weather.gov/zones/forecast/', '');
                                        zoneToPush = forecastZones[affectedZones[i]];
                                    } else if (affectedZones[i].includes('county')) {
                                        affectedZones[i] = affectedZones[i].replace('https://api.weather.gov/zones/county/', '');
                                        zoneToPush = countyZones[affectedZones[i]];
                                    } else if (affectedZones[i].includes('fire')) {
                                        affectedZones[i] = affectedZones[i].replace('https://api.weather.gov/zones/fire/', '');
                                        zoneToPush = fireZones[affectedZones[i]];
                                    }
                                    if (zoneToPush != undefined) {
                                        pushNewPolygon(zoneToPush.geometry, data.features[item].properties)
                                    }
                                }
                            }
                        }
                        var mergedGeoJSON = geojsonMerge.merge([
                            polygonGeojson,
                            data
                        ]);
                        map.getSource('mainAlertsSource').setData(mergedGeoJSON);

                        $('#showExtraAlertPolygonsCheckbox').show();
                        $('#showExtraAlertPolygonsCheckbox').on('click', function() {
                            var isChecked = $('#showExtraAlertPolygonsCheckBtn').is(":checked");

                            if (!isChecked) {
                                map.getSource('mainAlertsSource').setData(data);
                            } else if (isChecked) {
                                map.getSource('mainAlertsSource').setData(mergedGeoJSON);
                            }
                        })
                        });});});
                    }, 50)
                }
                loadExtraAlerts();
            })
        }
    } else if ($(iconElem).hasClass('icon-blue')) {
        $(iconElem).removeClass('icon-blue');
        $(iconElem).addClass('icon-grey');

        map.getCanvas().style.cursor = "";
        map.off('click', 'mainAlertsLayerFill', mapClick);

        map.setLayoutProperty('mainAlertsLayer', 'visibility', 'none');
        map.setLayoutProperty('mainAlertsLayerFill', 'visibility', 'none');
        map.setLayoutProperty('mainAlertsLayerOutline', 'visibility', 'none');
    }
})