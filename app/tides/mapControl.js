const createMenuOption = require('../radar/menu/createMenuOption');
const loadMarkers = require('./loadMarkers');
var map = require('../radar/map/map');

function addTideStationsControl(divName) {
    createMenuOption({
        'divId': 'tideStationMenuItemDiv',
        'iconId': 'tideStationMenuItemIcon',
    
        'divClass': 'mapFooterMenuItem',
        'iconClass': 'icon-black',
    
        'contents': 'Tide Stations',
        'icon': 'fa fa-water',
        'css': ''
    }, function(divElem, iconElem) {
        if (!$(iconElem).hasClass('icon-blue')) {
            $(iconElem).addClass('icon-blue');
            $(iconElem).removeClass('icon-black');
    
            if (map.getLayer('tideStationDots')) {
                // layer does exist - toggle the visibility to on
                loadMarkers.toggleTideStationMarkers('show');
            } else {
                // layer doesn't exist - load it onto the map for the first time
                loadMarkers.loadTideStationMarkers(divName);
            }
        } else if ($(iconElem).hasClass('icon-blue')) {
            $(iconElem).removeClass('icon-blue');
            $(iconElem).addClass('icon-black');
            // layer does exist - toggle the visibility to off
            loadMarkers.toggleTideStationMarkers('hide');
        }
    })
}

module.exports = {
    addTideStationsControl
}