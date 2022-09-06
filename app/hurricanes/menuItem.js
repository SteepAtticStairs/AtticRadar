const ut = require('../radar/utils');
const createMenuOption = require('../radar/menu/createMenuOption');
var map = require('../radar/map/map');

function loadHurricanesControl(layerArray) {
    createMenuOption({
        'divId': 'hurricanesMenuItemDiv',
        'iconId': 'hurricanesMenuItemIcon',

        'divClass': 'mapFooterMenuItem',
        'iconClass': 'icon-blue',

        'contents': 'Hurricane Tracker',
        'icon': 'fa fa-hurricane',
        'css': ''
    }, function(divElem, iconElem) {
        if (!$(iconElem).hasClass('icon-blue')) {
            $(iconElem).removeClass('icon-black');
            $(iconElem).addClass('icon-blue');

            for (var i = 0; i < layerArray.length; i++) {
                map.setLayoutProperty(layerArray[i], 'visibility', 'visible');
            }
        } else if ($(iconElem).hasClass('icon-blue')) {
            $(iconElem).removeClass('icon-blue');
            $(iconElem).addClass('icon-black');

            for (var i = 0; i < layerArray.length; i++) {
                map.setLayoutProperty(layerArray[i], 'visibility', 'none');
            }
        }
    })
}

module.exports = {
    loadHurricanesControl
};