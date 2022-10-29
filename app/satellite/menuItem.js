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
            loadImage({
                'satelliteNum': '16',
                'channel': 'veggie',
                'sector': 'fulldisk'
            });
            // satNum = '16'; // 16, 17, or 18
            // channel = '13'; // 01 - 16
            // sector = 'conus'
            /*
            alaska (no goes 16)
            conus
            fulldisk
            hawaii (no goes 16)
            mesoscale-1
            mesoscale-2
            puertorico (only goes 16)
            */
        }
    } else if ($(iconElem).hasClass('icon-blue')) {
        $(iconElem).removeClass('icon-blue');
        $(iconElem).addClass('icon-grey');

        // layer does exist - toggle the visibility to off
        map.setLayoutProperty('satelliteLayer', 'visibility', 'none');
    }
})