const createMenuOption = require('../../core/menu/createMenuOption');
const showStations = require('./station_markers');
const ut = require('../../core/utils');
const map = require('../../core/map/map');

const divElem = '#stationMenuItemDiv';
const iconElem = '#stationMenuItemIcon';

$(iconElem).on('click', function() {
    if ($(iconElem).hasClass('icon-grey')) {
        $(iconElem).removeClass('icon-grey');
        $(iconElem).addClass('icon-blue');

        $('#dataDiv').data('stationMarkersVisible', true);
        if (map.getLayer('stationSymbolLayer')) {
            // station marker layer already exists, simply toggle visibility here
            map.setLayoutProperty('stationSymbolLayer', 'visibility', 'visible');
        } else {
            // station marker layer does not exist, load it into the map style
            showStations();
        }
    } else if ($(iconElem).hasClass('icon-blue')) {
        $(iconElem).removeClass('icon-blue');
        $(iconElem).addClass('icon-grey');

        $('#dataDiv').data('stationMarkersVisible', false);
        // hide the station marker layer
        map.setLayoutProperty('stationSymbolLayer', 'visibility', 'none');
    }
})

$('#stationMenuItemIcon').removeClass('icon-grey');
$('#stationMenuItemIcon').addClass('icon-blue');
showStations();