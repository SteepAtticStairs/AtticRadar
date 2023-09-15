const createMenuOption = require('../../core/menu/createMenuOption');
const showStations = require('./station_markers');
const ut = require('../../core/utils');
const map = require('../../core/map/map');

const divElem = '#stationMenuItemDiv';
const iconElem = '#stationMenuItemIcon';

$(iconElem).on('click', function() {
    if ($(iconElem).hasClass('menu_item_not_selected')) {
        $(iconElem).removeClass('menu_item_not_selected');
        $(iconElem).addClass('menu_item_selected');

        $('#dataDiv').data('stationMarkersVisible', true);
        if (map.getLayer('stationSymbolLayer')) {
            // station marker layer already exists, simply toggle visibility here
            map.setLayoutProperty('stationSymbolLayer', 'visibility', 'visible');
        } else {
            // station marker layer does not exist, load it into the map style
            showStations();
        }
    } else if ($(iconElem).hasClass('menu_item_selected')) {
        $(iconElem).removeClass('menu_item_selected');
        $(iconElem).addClass('menu_item_not_selected');

        $('#dataDiv').data('stationMarkersVisible', false);
        // hide the station marker layer
        map.setLayoutProperty('stationSymbolLayer', 'visibility', 'none');
    }
})

$('#stationMenuItemIcon').removeClass('menu_item_not_selected');
$('#stationMenuItemIcon').addClass('menu_item_selected');
showStations();