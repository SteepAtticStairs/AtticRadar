const createMenuOption = require('./createMenuOption');
const showStations = require('../map/controls/stationMarkers');
const ut = require('../utils');

createMenuOption({
    'divId': 'stationMenuItemDiv',
    'iconId': 'stationMenuItemIcon',

    'divClass': 'mapFooterMenuItem',
    'iconClass': 'icon-black',

    'contents': 'Station Markers',
    'icon': 'fa fa-satellite-dish',
    'css': ''
}, function(divElem, iconElem) {
    if ($(iconElem).hasClass('icon-black')) {
        $(iconElem).removeClass('icon-black');
        $(iconElem).addClass('icon-blue');

        showStations();
    } else if ($(iconElem).hasClass('icon-blue')) {
        $(iconElem).removeClass('icon-blue');
        $(iconElem).addClass('icon-black');

        var statMarkerArr = $('#dataDiv').data('statMarkerArr');
        for (key in statMarkerArr) {
            statMarkerArr[key].remove();
        }
    }
})

$('#stationMenuItemIcon').removeClass('icon-black');
$('#stationMenuItemIcon').addClass('icon-blue');
setTimeout(function() {
    showStations();
}, 200)