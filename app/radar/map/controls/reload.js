const createToolsOption = require('../../menu/createToolsOption');

// createMenuOption({
//     'divId': 'reloadItemDiv',
//     'iconId': 'reloadItemClass',

//     'divClass': 'mapFooterMenuItem',
//     'iconClass': 'icon-grey',

//     'contents': 'Reload',
//     'icon': 'fa fa-arrow-rotate-right',
//     'css': ''
// }, function(divElem, iconElem) {
//     window.location.reload();
// })

function distanceReloadOption(index) {
    createToolsOption({
        'divId': 'reloadItemDiv',
        'iconId': 'reloadItemClass',

        'index': index,

        'divClass': 'mapFooterMenuItem',
        'iconClass': 'icon-grey',

        'contents': 'Reload',
        'icon': 'fa fa-arrow-rotate-right',
        'css': ''
    }, function(divElem, iconElem) {
        window.location.reload();
    })
}

module.exports = {
    distanceReloadOption
};