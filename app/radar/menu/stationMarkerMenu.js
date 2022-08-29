const createMenuOption = require('./createMenuOption');
const showStations = require('../map/controls/stationMarkers');
const ut = require('../utils');

createMenuOption({
    'id': 'stationMenuItem',
    'class': 'alert alert-secondary offCanvasMenuItem',
    'contents': 'Station Markers',
    'icon': 'fa fa-satellite-dish',
    'css': ''
}, function(thisObj, innerDiv, iconElem) {
    if ($(thisObj).hasClass('alert-secondary')) {
        $(thisObj).removeClass('alert-secondary');
        $(thisObj).addClass('alert-primary');

        showStations();
    } else if ($(thisObj).hasClass('alert-primary')) {
        $(thisObj).removeClass('alert-primary');
        $(thisObj).addClass('alert-secondary');

        var statMarkerArr = $('#dataDiv').data('statMarkerArr');
        for (key in statMarkerArr) {
            statMarkerArr[key].remove();
        }
    }
})

setTimeout(function() {
    $('#stationMenuItem').addClass('alert-primary');
    $('#stationMenuItem').removeClass('alert-secondary');
    showStations();
}, 200)