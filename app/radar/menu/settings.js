const createOffCanvasItem = require('./createOffCanvasItem');
const ut = require('../utils');
const map = require('../map/map');
const setBaseMapLayers = require('../misc/baseMapLayers');
const terminator = require('../map/terminator/terminator');

createOffCanvasItem({
    'id': 'settingsMenuItem',
    'class': 'alert alert-secondary offCanvasMenuItem',
    'contents': 'Settings',
    'icon': 'fa fa-gear',
    'css': ''
}, function(thisObj, innerDiv, iconElem) {
    $('#settingsModalTrigger').click();

    $('#stormTracksCheckbox').on('click', function() {
        var isChecked = $('#stormTracksCheckBtn').is(":checked");
        $('#dataDiv').data('stormTracksVisibility', isChecked);

        var stLayers = $('#dataDiv').data('stormTrackMapLayers')
        if (!isChecked) {
            for (var item in stLayers) {
                map.setLayoutProperty(stLayers[item], 'visibility', 'none');
            }
        } else if (isChecked) {
            for (var item in stLayers) {
                map.setLayoutProperty(stLayers[item], 'visibility', 'visible');
            }
        }
    })

    $('#radarVisibilityCheckbox').on('click', function() {
        var isChecked = $('#radarVisibilityCheckBtn').is(":checked");

        if (!isChecked) {
            if (map.getLayer('baseReflectivity')) {
                map.setLayoutProperty('baseReflectivity', 'visibility', 'none');
            }
        } else if (isChecked) {
            if (map.getLayer('baseReflectivity')) {
                map.setLayoutProperty('baseReflectivity', 'visibility', 'visible');
            }
        }
    })

    $('#showExtraMapLayersCheckbox').on('click', function() {
        var isChecked = $('#showExtraMapLayersCheckBtn').is(":checked");

        if (!isChecked) {
            setBaseMapLayers('cities');
        } else if (isChecked) {
            setBaseMapLayers('both');
        }
    })

    $('#showDayNightLineLayersCheckbox').on('click', function() {
        var isChecked = $('#showDayNightLineCheckBtn').is(":checked");

        if (!isChecked) {
            terminator.toggleVisibility('hide');
        } else if (isChecked) {
            terminator.toggleVisibility('show');
        }
    })

    // this is in app/alerts/drawAlertShapes.js
    //$('#showExtraAlertPolygonsCheckbox').on('click', function() {})
})