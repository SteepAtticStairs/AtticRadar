var map = require('../../core/map/map');
const mapFuncs = require('../../core/map/mapFunctions');

function setBaseMapLayers(roadsOrCitiesOrBoth) {
    const layers = map.getStyle().layers;
    var allCityLayers = [];
    var allRoadLayers = [];
    for (const layer of layers) {
        //console.log(layer.id)
        if (layer.type === 'symbol') {
            allCityLayers.push(layer.id);
        } else if (layer.type === 'line') {
            allRoadLayers.push(layer.id);
        }
    }

    // road-minor-low
    // road-street-low
    // road-minor-case
    // road-street-case
    // road-secondary-tertiary-case
    // road-primary-case
    // road-major-link-case
    // road-motorway-trunk-case
    // road-construction
    // road-path
    // road-steps
    // road-major-link
    // road-pedestrian
    // road-minor
    // road-street
    // road-secondary-tertiary
    // road-primary
    // road-motorway-trunk
    // road-rail

    // land-structure-line

    const mainRoadLayers = [
        'road-minor-low',
        'road-street-low',
        'road-construction',
        'road-path',
        'road-steps',
        'road-major-link',
        'road-pedestrian',
        'road-minor',
        'road-street',
        'road-secondary-tertiary',
        'road-primary',
        'road-motorway-trunk',
        'road-rail'
    ]
    function loadRoads() {
        for (item in mainRoadLayers) {
            mapFuncs.moveMapLayer(mainRoadLayers[item]);
        }
    }
    function loadCities() {
        for (item in allCityLayers) {
            mapFuncs.moveMapLayer(allCityLayers[item]);
        }
    }
    // mapFuncs.moveMapLayer('baseReflectivity');
    if (roadsOrCitiesOrBoth == 'roads') {
        loadRoads();
    } else if (roadsOrCitiesOrBoth == 'cities') {
        loadCities();
    } else if (roadsOrCitiesOrBoth == 'both') {
        loadRoads();
        loadCities();
    }
    // var stLayers = $('#dataDiv').data('stormTrackMapLayers')
    // for (var item in stLayers) {
    //     mapFuncs.moveMapLayer(stLayers[item]);
    // }
}

module.exports = setBaseMapLayers;