const turf = require('@turf/turf');
const ut = require('../utils');
const map = require('../../core/map/map');
const get_station_status = require('../misc/getStationStatus');

const NEXRADLevel2File = require('../libnexrad/level2/level2_parser');
const Level2Factory = require('../libnexrad/level2/level2_factory');

const NEXRADLevel3File = require('../libnexrad/level3/level3_parser');
const Level3Factory = require('../libnexrad/level3/level3_factory');

const loaders_nexrad = require('../libnexrad/loaders_nexrad');
const nexrad_locations = require('../libnexrad/nexrad_locations').NEXRAD_LOCATIONS;

function _copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function do_when_map_load(func) {
    setTimeout(function() {
        if (map.loaded()) {
            func();
        } else {
            map.on('load', function() {
                func();
            })
        }
    }, 0)
}

/**
 * Helper function that generates a geojson object from a simple object with radar station data.
 * 
 * @param {Object} status_info OPTIONAL - An object containing the status of each radar station, from the "get_station_status" function.
 * @returns {Object} A geojson object containing the radar station data.
 */
function _generate_stations_geojson(status_info = null) {
    var points = [];
    for (var station in nexrad_locations) {
        if (nexrad_locations[station].NONSTANDARD == undefined || nexrad_locations[station].NONSTANDARD == false) {
            if (nexrad_locations[station].type == 'WSR-88D' || nexrad_locations[station].type == 'TDWR') {
                const lat = nexrad_locations[station].lat;
                const lon = nexrad_locations[station].lon;

                const station_properties = _copy(nexrad_locations[station]);
                station_properties.station_id = station;
                if (status_info != null) {
                    station_properties.status = status_info[station].status;
                }

                const point = turf.point([lon, lat], station_properties);
                points.push(point);
            }
        }
    }
    const feature_collection = turf.featureCollection(points);
    return feature_collection;
}

/**
 * Helper function that adds the radar station layer to the map.
 * 
 * @param {Object} radar_stations_geojson A geojson object containing the radar station data. Comes from the "_generate_stations_geojson" function.
 * @param {Function} callback A callback function.
 */
function _add_stations_layer(radar_stations_geojson, callback) {
    do_when_map_load(() => {
        map.addSource('stationSymbolLayer', {
            'type': 'geojson',
            'generateId': true,
            'data': radar_stations_geojson
        });

        // Add a symbol layer
        map.addLayer({
            'id': 'stationSymbolLayer',
            'type': 'symbol',
            'source': 'stationSymbolLayer',
            'layout': {
                'icon-image': [
                    'case',
                    ['==', ['get', 'clicked'], 'yes'],
                    'blue_station_marker',
                    ['==', ['get', 'status'], 'down'],
                    'red_station_marker',
                    ['==', ['get', 'type'], 'TDWR'],
                    'orange_station_marker',
                    // ['==', ['feature-state', 'color'], 1],
                    // 'dark_grey_station_marker', // mouse-over
                    // ['==', ['feature-state', 'color'], 2],
                    // 'grey_station_marker',
                    'grey_station_marker'
                ],

                'icon-size': 0.23,
                'text-field': ['get', 'station_id'],
                'text-size': 13,
                'text-font': [
                    'Arial Unicode MS Bold'
                ],
            },
            'paint': {
                'text-color': 'black'
            }
        });

        get_station_status((data) => {
            window.atticData.radar_station_status = data;
            const statusified_geojson = _generate_stations_geojson(data);
            map.getSource('stationSymbolLayer').setData(statusified_geojson);
        })

        callback();
    });
}

/**
 * Code that executes when the mouse enters a station's bubble
 */
function mouse_over() {
    map.getCanvas().style.cursor = 'pointer';
}
/**
 * Code that executes when the mouse leaves a station's bubble
 */
function mouse_out() {
    map.getCanvas().style.cursor = '';
}

function mouse_move(e) {
    const station = e.features[0].properties.station_id;
    const geojson = map.getSource('stationSymbolLayer')._data;
    for (var i in geojson.features) {
        if (geojson.features[i].properties.station_id == station) {
            geojson.features[i].properties.clicked = 'yes';
        } else {
            geojson.features[i].properties.clicked = 'no';
        }
    }
    map.getSource('stationSymbolLayer').setData(geojson);
}

/**
 * Function that enables all mouse-related event listeners for the radar station layer
 */
function _enable_mouse_listeners() {
    map.on('mouseover', 'stationSymbolLayer', mouse_over);
    map.on('mouseout', 'stationSymbolLayer', mouse_out);
    map.on('click', 'stationSymbolLayer', mouse_move);
}
/**
 * Function that disables all mouse-related event listeners for the radar station layer
 */
function _disable_mouse_listeners() {
    map.off('mouseover', 'stationSymbolLayer', mouse_over);
    map.off('mouseout', 'stationSymbolLayer', mouse_out);
    map.off('click', 'stationSymbolLayer', mouse_move);
}

/**
 * Initialize the mouse listeners for the first time.
 */
function _init_mouse_listeners() {
    _enable_mouse_listeners();
}
/**
 * Initialize the click listener for the first time.
 */
function _init_click_listener() {
    map.on('click', 'stationSymbolLayer', (e) => {
        const base = e.features[0].properties;
        const clickedStation = base.station_id;
        window.atticData.currentStation = clickedStation;
        $('#radarStation').html(clickedStation);
        $('#radarLocation').html(nexrad_locations[clickedStation].name);
        const stationType = base.type;
        window.atticData.L2_file_id = '';

        var productToLoad;
        var abbvProductToLoad;
        if (stationType == 'WSR-88D') {
            $('#wsr88d_psm').show();
            $('#tdwr_psm').hide();
            $('#level2_psm').hide();

            productToLoad = 'N0B';
            abbvProductToLoad = 'ref';
            // $(`.productOption[value="${abbvProductToLoad}"]`).html()
            $('#productsDropdownTriggerText').html(window.longProductNames[abbvProductToLoad]);
        } else if (stationType == 'TDWR') {
            $('#wsr88d_psm').hide();
            $('#tdwr_psm').show();
            $('#level2_psm').hide();

            productToLoad = 'TZ0';
            abbvProductToLoad = 'sr-ref';
            // $(`.productOption[value="${abbvProductToLoad}"]`).html()
            $('#productsDropdownTriggerText').html(window.longProductNames[abbvProductToLoad]);
        }

        $('#radarInfoSpan').show();

        window.atticData.from_file_upload = false;
        loaders_nexrad.quick_level_3_plot(clickedStation, productToLoad, (L3Factory) => {});
    });
}


/**
 * Main function.
 */
function showStations() {
    const radar_stations_geojson = _generate_stations_geojson();

    _add_stations_layer(radar_stations_geojson, () => {
        _init_mouse_listeners();
        _init_click_listener();
    });
}

module.exports = showStations;