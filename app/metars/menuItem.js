const createMenuOption = require('../radar/menu/createMenuOption');
const fetchMETARData = require('./fetchData');
const useData = require('./useData');
var map = require('../core/map/map');

const divElem = '#metarStationMenuItemDiv';
const iconElem = '#metarStationMenuItemIcon';

$(iconElem).on('click', function() {
    if (!$(iconElem).hasClass('icon-blue')) {
        $(iconElem).addClass('icon-blue');
        $(iconElem).removeClass('icon-grey');

        $('#dataDiv').data('metarsActive', true);

        if (map.getLayer('metarSymbolLayer')) {
            // layer does exist - toggle the visibility to on
            useData.toggleMETARStationMarkers('show');
        } else {
            // layer doesn't exist - load it onto the map for the first time
            fetchMETARData.fetchMETARData('load');
        }
    } else if ($(iconElem).hasClass('icon-blue')) {
        $(iconElem).removeClass('icon-blue');
        $(iconElem).addClass('icon-grey');

        $('#dataDiv').data('metarsActive', false);

        // layer does exist - toggle the visibility to off
        useData.toggleMETARStationMarkers('hide');
    }
})