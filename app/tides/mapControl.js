const armFunctions = require('../radar/menu/atticRadarMenu');
const loadMarkers = require('./loadMarkers');
var map = require('../radar/map/map');

function addTideStationsControl(divName) {
    armFunctions.toggleswitchFunctions($('#armrTideStationsBtnSwitchElem'), function() {
        if (map.getLayer('tideStationDots')) {
            // layer does exist - toggle the visibility to on
            loadMarkers.toggleTideStationMarkers('show');
        } else {
            // layer doesn't exist - load it onto the map for the first time
            loadMarkers.loadTideStationMarkers(divName);
        }
    }, function() {
        // layer does exist - toggle the visibility to off
        loadMarkers.toggleTideStationMarkers('hide');
    })

    // createOffCanvasItem({
    //     'id': 'tideStationMenuItem',
    //     'class': 'alert alert-secondary offCanvasMenuItem',
    //     'contents': 'Tide Stations',
    //     'icon': 'fa fa-water',
    //     'css': ''
    // }, function(thisObj, innerDiv, iconElem) {
    //     if (!$(thisObj).hasClass('alert-primary')) {
    //         $(thisObj).addClass('alert-primary');
    //         $(thisObj).removeClass('alert-secondary');

    //         if (map.getLayer('tideStationDots')) {
    //             // layer does exist - toggle the visibility to on
    //             loadMarkers.toggleTideStationMarkers('show');
    //         } else {
    //             // layer doesn't exist - load it onto the map for the first time
    //             loadMarkers.loadTideStationMarkers(divName);
    //         }
    //     } else if ($(thisObj).hasClass('alert-primary')) {
    //         $(thisObj).removeClass('alert-primary');
    //         $(thisObj).addClass('alert-secondary');
    //         // layer does exist - toggle the visibility to off
    //         loadMarkers.toggleTideStationMarkers('hide');
    //     }
    // })

    // $('#helpMenuItem_outer').insertAfter('#tideStationMenuItem_outer');
    // $(document.createElement('br')).insertAfter('#helpMenuItem_outer');
}

module.exports = {
    addTideStationsControl
}