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
$('#colorPickerItemDiv').insertAfter('#metarStationMenuItemDiv');
$(document.createTextNode('\u00A0\u00A0\u00A0')).insertAfter('#metarStationMenuItemDiv');