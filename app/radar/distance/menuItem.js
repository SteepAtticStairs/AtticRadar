const createToolsOption = require('../menu/createToolsOption');
const distanceMeasure = require('./distanceMeasure');

// createOffCanvasItem({
//     'id': 'distanceMeasureMenuItem',
//     'class': 'alert alert-secondary offCanvasMenuItem',
//     'contents': 'Distance Measure Tool',
//     'icon': 'fa fa-ruler',
//     'css': ''
// }, function(thisObj, innerDiv, iconElem) {
//     if (!$(thisObj).hasClass('alert-primary')) {
//         $(thisObj).addClass('alert-primary');
//         $(thisObj).removeClass('alert-secondary');

//         distanceMeasure.initDistanceMeasureListeners();
//     } else if ($(thisObj).hasClass('alert-primary')) {
//         $(thisObj).removeClass('alert-primary');
//         $(thisObj).addClass('alert-secondary');

//         distanceMeasure.disableDistanceMeasure();
//     }
// })

function distanceToolsOption(index) {
    createToolsOption({
        'divId': 'distanceItemDiv',
        'iconId': 'distanceItemClass',

        'index': index,

        'divClass': 'mapFooterMenuItem',
        'iconClass': 'icon-grey',

        'contents': 'Distance Measurement Tool',
        'icon': 'fa fa-ruler',
        'css': ''
    }, function(divElem, iconElem) {
        if (!$(iconElem).hasClass('icon-blue')) {
            $(iconElem).addClass('icon-blue');
            $(iconElem).removeClass('icon-grey');

            distanceMeasure.initDistanceMeasureListeners();
        } else if ($(iconElem).hasClass('icon-blue')) {
            $(iconElem).removeClass('icon-blue');
            $(iconElem).addClass('icon-grey');

            distanceMeasure.disableDistanceMeasure();
        }
    })
}

module.exports = {
    distanceToolsOption
};