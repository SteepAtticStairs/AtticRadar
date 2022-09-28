const createMenuOption = require('../radar/menu/createMenuOption');
const createOffCanvasItem = require('../radar/menu/createOffCanvasItem');
const loadMarkers = require('./loadMarkers');
var map = require('../radar/map/map');

function addTideStationsControl(divName) {
    createOffCanvasItem({
        'id': 'tideStationMenuItem',
        'class': 'alert alert-secondary offCanvasMenuItem',
        'contents': 'Tide Stations',
        'icon': 'fa fa-water',
        'css': ''
    }, function(thisObj, innerDiv, iconElem) {
        if (!$(thisObj).hasClass('alert-primary')) {
            $(thisObj).addClass('alert-primary');
            $(thisObj).removeClass('alert-secondary');

            if (map.getLayer('tideStationDots')) {
                // layer does exist - toggle the visibility to on
                loadMarkers.toggleTideStationMarkers('show');
            } else {
                // layer doesn't exist - load it onto the map for the first time
                loadMarkers.loadTideStationMarkers(divName);
            }
        } else if ($(thisObj).hasClass('alert-primary')) {
            $(thisObj).removeClass('alert-primary');
            $(thisObj).addClass('alert-secondary');
            // layer does exist - toggle the visibility to off
            loadMarkers.toggleTideStationMarkers('hide');
        }
    })
}

module.exports = {
    addTideStationsControl
}