const createControl = require('../radar/map/controls/createControl');
const loadMarkers = require('./loadMarkers');
var map = require('../radar/map/map');

function addTideStationsControl(divName) {
    createControl({
        'id': 'tideStationsThing',
        'position': 'top-left',
        'icon': 'fa-water',
        'css': 'margin-top: 100%;'
    }, function() {
        if (!$('#tideStationsThing').hasClass('icon-selected')) {
            $('#tideStationsThing').addClass('icon-selected');
            $('#tideStationsThing').removeClass('icon-black');

            if (map.getLayer('tideStationDots')) {
                // layer does exist - toggle the visibility to on
                loadMarkers.toggleTideStationMarkers('show');
            } else {
                // layer doesn't exist - load it onto the map for the first time
                loadMarkers.loadTideStationMarkers(divName);
            }
        } else if ($('#tideStationsThing').hasClass('icon-selected')) {
            $('#tideStationsThing').removeClass('icon-selected');
            $('#tideStationsThing').addClass('icon-black');
            // layer does exist - toggle the visibility to off
            loadMarkers.toggleTideStationMarkers('hide');
        }
    })
}

module.exports = {
    addTideStationsControl
}