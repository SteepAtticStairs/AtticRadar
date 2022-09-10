const createMenuOption = require('../radar/menu/createMenuOption');
const fetchMETARData = require('./fetchData');
const useData = require('./useData');
var map = require('../radar/map/map');

createMenuOption({
    'divId': 'metarStationMenuItemDiv',
    'iconId': 'metarStationMenuItemIcon',

    'divClass': 'mapFooterMenuItem',
    'iconClass': 'icon-grey',

    'contents': 'METAR Stations',
    'icon': 'fa fa-temperature-half',
    'css': ''
}, function(divElem, iconElem) {
    if (!$(iconElem).hasClass('icon-blue')) {
        $(iconElem).addClass('icon-blue');
        $(iconElem).removeClass('icon-grey');

        if (map.getLayer('metarStations')) {
            // layer does exist - toggle the visibility to on
            useData.toggleMETARStationMarkers('show');
        } else {
            // layer doesn't exist - load it onto the map for the first time
            fetchMETARData.fetchMETARData();
        }
    } else if ($(iconElem).hasClass('icon-blue')) {
        $(iconElem).removeClass('icon-blue');
        $(iconElem).addClass('icon-grey');
        // layer does exist - toggle the visibility to off
        useData.toggleMETARStationMarkers('hide');
    }
})