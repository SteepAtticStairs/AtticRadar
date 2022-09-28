const createMenuOption = require('../../menu/createMenuOption');
const createOffCanvasItem = require('../../menu/createOffCanvasItem');

createMenuOption({
    'divId': 'offcanvasMenuItemDiv',
    'iconId': 'offcanvasMenuItemIcon',

    'divClass': 'mapFooterMenuItem',
    'iconClass': 'icon-grey',

    'contents': 'Open Offcanvas Menu',
    'icon': 'fa fa-bars',
    'css': ''
}, function(divElem, iconElem) {
    $('#offCanvasBtn').click();
    if (!$(iconElem).hasClass('icon-blue')) {
        //$(iconElem).addClass('icon-blue');
        //$(iconElem).removeClass('icon-grey');
    } else if ($(iconElem).hasClass('icon-blue')) {
        //$(iconElem).removeClass('icon-blue');
        //$(iconElem).addClass('icon-grey');

        // layer does exist - toggle the visibility to off
        // map.setLayoutProperty('satelliteLayer', 'visibility', 'none');
    }
})