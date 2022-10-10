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

        if (map.getLayer('newAlertsLayer')) {
            //map.getCanvas().style.cursor = "crosshair";
            map.on('click', 'newAlertsLayer', mapClick)
            map.setLayoutProperty('newAlertsLayer', 'visibility', 'visible');
            map.setLayoutProperty('newAlertsLayerOutline', 'visibility', 'visible');
        } else {
            //map.getCanvas().style.cursor = "crosshair";
            map.on('click', 'newAlertsLayer', mapClick)

            fetchPolygonData([noaaAlertsURL], function(data) {
                for (var item in data.features) {
                    data.features[item].properties.color = getPolygonColors(data.features[item].properties.event);
                }
                console.log(data)
                map.addSource('alertsSource', {
                    type: 'geojson',
                    data: data,
                })
                map.addLayer({
                    'id': `newAlertsLayer`,
                    'type': 'fill',
                    'source': 'alertsSource',
                    paint: {
                        //#0080ff blue
                        //#ff7d7d red
                        'fill-color': ['get', 'color'],
                        'fill-opacity': 0
                    }
                }, 'stationSymbolLayer');
                map.addLayer({
                    'id': `newAlertsLayerOutline`,
                    'type': 'line',
                    'source': 'alertsSource',
                    'paint': {
                        //#014385 blue
                        //#850101 red
                        'line-color': ['get', 'color'],
                        'line-width': 3
                    }
                }, 'stationSymbolLayer');

                map.on('mouseover', 'newAlertsLayer', function(e) {
                    map.getCanvas().style.cursor = 'pointer';
                });
                map.on('mouseout', 'newAlertsLayer', function(e) {
                    map.getCanvas().style.cursor = '';
                });

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
                    data,
                    polygonGeojson
                ]);
                map.getSource('alertsSource').setData(mergedGeoJSON);
                //map.moveLayer('stationSymbolLayer');
                // newAlertsArr.push(`newAlertsLayerOutline`);
                // newAlertsArr.push(`newAlertsLayer`);

                // // map.on('click', 'newAlertsLayer', (e) => {
                // //     for (key in e.features) {
                // //         ut.colorLog(e.features[key].properties.CAP_ID, 'green')
                // //     }
                // // });
            })
        }
    } else if ($(iconElem).hasClass('icon-blue')) {
        $(iconElem).removeClass('icon-blue');
        $(iconElem).addClass('icon-grey');

        map.getCanvas().style.cursor = "";
        map.off('click', 'newAlertsLayer', mapClick)

        map.setLayoutProperty('newAlertsLayer', 'visibility', 'none');
        map.setLayoutProperty('newAlertsLayerOutline', 'visibility', 'none');
    }
})