const createMenuOption = require('../../menu/createMenuOption');
var map = require('../map');

createMenuOption({
    'divId': 'reloadItemDiv',
    'iconId': 'reloadItemClass',

    'divClass': 'mapFooterMenuItem',
    'iconClass': 'icon-grey',

    'contents': 'Reload',
    'icon': 'fa fa-arrow-rotate-right',
    'css': ''
}, function(divElem, iconElem) {
    window.location.reload();
})