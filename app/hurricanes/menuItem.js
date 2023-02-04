const ut = require('../radar/utils');
const createMenuOption = require('../radar/menu/createMenuOption');
const armFunctions = require('../radar/menu/atticRadarMenu');
const fetchData = require('./fetchData');
var map = require('../radar/map/map');

var layerArray = $('#dataDiv').data('hurricaneMapLayers');

armFunctions.toggleswitchFunctions($('#armrHurricanesBtnSwitchElem'), function() {
    if (map.getLayer(layerArray[0])) {
        for (var i = 0; i < layerArray.length; i++) {
            map.setLayoutProperty(layerArray[i], 'visibility', 'visible');
        }
    } else {
        fetchData();
    }
}, function() {
    for (var i = 0; i < layerArray.length; i++) {
        map.setLayoutProperty(layerArray[i], 'visibility', 'none');
    }
})

// createMenuOption({
//     'divId': 'hurricanesMenuItemDiv',
//     'iconId': 'hurricanesMenuItemIcon',

//     'divClass': 'mapFooterMenuItem',
//     'iconClass': 'icon-grey',

//     'contents': 'Hurricane Tracker',
//     'icon': 'fa fa-hurricane',
//     'css': ''
// }, function(divElem, iconElem) {
//     var layerArray = $('#dataDiv').data('hurricaneMapLayers');
//     if (!$(iconElem).hasClass('icon-blue')) {
//         $(iconElem).removeClass('icon-grey');
//         $(iconElem).addClass('icon-blue');

//         if (map.getLayer(layerArray[0])) {
//             for (var i = 0; i < layerArray.length; i++) {
//                 map.setLayoutProperty(layerArray[i], 'visibility', 'visible');
//             }
//         } else {
//             fetchData();
//         }
//     } else if ($(iconElem).hasClass('icon-blue')) {
//         $(iconElem).removeClass('icon-blue');
//         $(iconElem).addClass('icon-grey');

//         for (var i = 0; i < layerArray.length; i++) {
//             map.setLayoutProperty(layerArray[i], 'visibility', 'none');
//         }
//     }
// })