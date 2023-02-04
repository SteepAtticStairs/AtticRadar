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

    $('#armrSTVisBtnSwitchElem').on('click', function() {
        var isChecked = $(this).is(':checked');
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

    armFunctions.toggleswitchFunctions($('#armrRadarVisBtnSwitchElem'), function() {
        if (map.getLayer('baseReflectivity')) {
            map.setLayoutProperty('baseReflectivity', 'visibility', 'visible');
        }
    }, function() {
        if (map.getLayer('baseReflectivity')) {
            map.setLayoutProperty('baseReflectivity', 'visibility', 'none');
        }
    })

    armFunctions.toggleswitchFunctions($('#armrRoadsStreetsVisBtnSwitchElem'), function() {
        setBaseMapLayers('both');
    }, function() {
        setBaseMapLayers('cities');
    })

    armFunctions.toggleswitchFunctions($('#armrDayNightLineVisBtnSwitchElem'), function() {
        terminator.toggleVisibility('show');
    }, function() {
        terminator.toggleVisibility('hide');
    })

    // this is in app/alerts/drawAlertShapes.js
    //$('#showExtraAlertPolygonsCheckbox').on('click', function() {})
}

module.exports = {
    settingsOption
};