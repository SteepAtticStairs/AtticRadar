const createToolsOption = require('./createToolsOption');
const createMenuOption = require('./createMenuOption');
const ut = require('../utils');
const map = require('../map/map');
const setBaseMapLayers = require('../misc/baseMapLayers');
const terminator = require('../map/terminator/terminator');
const armFunctions = require('./atticRadarMenu');

function settingsOption(index) {
    createMenuOption({
        'divId': 'settingsItemDiv',
        'iconId': 'settingsItemClass',

        'divClass': 'mapFooterMenuItem',
        'iconClass': 'icon-grey',

        'contents': 'Settings',
        'icon': 'fa fa-gear',
        'css': ''
    }, function(divElem, iconElem) {
        //$('#settingsModalTrigger').click();
        armFunctions.showARMwindow();

        $('#atticRadarMenuMainScreen').hide();
        $('#atticRadarMenuSettingsScreen').show();
    })

    $('#armrSTVisBtnSwitch').on('mouseup touchend', function() {
        var isChecked = !$('#armrSTVisBtnSwitchElem').is(':checked');
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

    $('#armrRadarVisBtnSwitch').on('mouseup touchend', function() {
        var isChecked = !$('#armrRadarVisBtnSwitchElem').is(':checked');

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

    $('#armrRoadsStreetsVisBtnSwitch').on('mouseup touchend', function() {
        var isChecked = !$('#armrRoadsStreetsVisBtnSwitchElem').is(':checked');

        if (!isChecked) {
            setBaseMapLayers('cities');
        } else if (isChecked) {
            setBaseMapLayers('both');
        }
    })

    $('#armrDayNightLineVisBtnSwitch').on('mouseup touchend', function() {
        var isChecked = !$('#armrDayNightLineVisBtnSwitchElem').is(':checked');

        if (!isChecked) {
            terminator.toggleVisibility('hide');
        } else if (isChecked) {
            terminator.toggleVisibility('show');
        }
    })

    // this is in app/alerts/drawAlertShapes.js
    //$('#showExtraAlertPolygonsCheckbox').on('click', function() {})
}

module.exports = {
    settingsOption
};