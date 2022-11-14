const createOffCanvasItem = require('../menu/createOffCanvasItem');
const distanceMeasure = require('./distanceMeasure');
var map = require('../map/map');

createOffCanvasItem({
    'id': 'distanceMeasureMenuItem',
    'class': 'alert alert-secondary offCanvasMenuItem',
    'contents': 'Distance Measure Tool',
    'icon': 'fa fa-ruler',
    'css': ''
}, function(thisObj, innerDiv, iconElem) {
    if (!$(thisObj).hasClass('alert-primary')) {
        $(thisObj).addClass('alert-primary');
        $(thisObj).removeClass('alert-secondary');

        distanceMeasure.initDistanceMeasureListeners();
    } else if ($(thisObj).hasClass('alert-primary')) {
        $(thisObj).removeClass('alert-primary');
        $(thisObj).addClass('alert-secondary');

        distanceMeasure.disableDistanceMeasure();
    }
})

$('#helpMenuItem_outer').insertAfter('#tideStationMenuItem_outer');
$(document.createElement('br')).insertAfter('#helpMenuItem_outer');