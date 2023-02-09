var map = require('../map/map');
const ut = require('../utils');
const createMenuOption = require('../menu/createMenuOption');
const getValue = require('./getValue');

createMenuOption({
    'divId': 'colorPickerItemDiv',
    'iconId': 'colorPickerItemClass',

    'divClass': 'mapFooterMenuItem',
    'iconClass': 'icon-grey',

    'contents': 'Color Picker',
    'icon': 'fa fa-binoculars', // fa-binoculars, fa-microscope, fa-magnifying-glass
    'css': ''
}, function(divElem, iconElem) {
    if (!$(iconElem).hasClass('icon-blue')) {
        $(iconElem).addClass('icon-blue');
        $(iconElem).removeClass('icon-grey');

        map.on('move', getValue);
        $('.colorPicker').show();

        // if (window.l3rad != undefined) {
        //     if (window.prevl3rad != window.l3rad) {
        //         window.prevl3rad = window.l3rad;
        //         calculateVerticies(window.l3rad, 3, {
        //             'mode': 'geojson'
        //         });
        //     }
        // } else if (window.l2rad != undefined) {
        //     if (window.prevl2radOpt != window.l2radOptions) {
        //         window.prevl2radOpt = window.l2radOptions;

        //         var opt = window.l2radOptions;
        //         calculateVerticies(window.l2rad, 2, {
        //             'product': opt[0],
        //             'elevation': opt[1],
        //             'mode': 'geojson'
        //         });
        //     }
        // }
    } else if ($(iconElem).hasClass('icon-blue')) {
        $(iconElem).removeClass('icon-blue');
        $(iconElem).addClass('icon-grey');

        $('.colorPicker').hide();
        map.off('move', getValue);
    }
})