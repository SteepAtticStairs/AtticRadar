var map = require('../radar/map/map');
const createMenuOption = require('../radar/menu/createMenuOption');
const loadImage = require('./loadImage');

createMenuOption({
    'divId': 'satelliteMenuItemDiv',
    'iconId': 'satelliteMenuItemIcon',

    'divClass': 'mapFooterMenuItem',
    'iconClass': 'icon-grey',

    'contents': 'Satellite Data',
    'icon': 'fa fa-satellite',
    'css': ''
}, function(divElem, iconElem) {
    if (!$(iconElem).hasClass('icon-blue')) {
        $(iconElem).addClass('icon-blue');
        $(iconElem).removeClass('icon-grey');

        if (map.getLayer('satelliteLayer')) {
            // layer does exist - toggle the visibility to on
            map.setLayoutProperty('satelliteLayer', 'visibility', 'visible');
        } else if (!map.getLayer('satelliteLayer')) {
            // layer doesn't exist - load it onto the map for the first time
            loadImage();
        }
    } else if ($(iconElem).hasClass('icon-blue')) {
        $(iconElem).removeClass('icon-blue');
        $(iconElem).addClass('icon-grey');

        // layer does exist - toggle the visibility to off
        map.setLayoutProperty('satelliteLayer', 'visibility', 'none');
    }
})