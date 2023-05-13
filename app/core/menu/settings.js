const ut = require('../../radar/utils');
const map = require('../map/map');
const setBaseMapLayers = require('../../radar/misc/baseMapLayers');
const terminator = require('../map/terminator/terminator');
const armFunctions = require('./atticRadarMenu');
const setLayerOrder = require('../map/setLayerOrder');

function settingsOption(index) {
    const divElem = '#settingsItemDiv';
    const iconElem = '#settingsItemClass';

    $(iconElem).on('click', function() {
        //$('#settingsModalTrigger').click();
        armFunctions.showARMwindow();

        $('#atticRadarMenuMainScreen').hide();
        $('#atticRadarMenuSettingsScreen').show();
    })

    $('#armrSTVisBtnSwitchElem').on('click', function() {
        var isChecked = $(this).is(':checked');
        $('#dataDiv').data('stormTracksVisibility', isChecked);

        var st_layers = window.atticData.storm_track_layers;
        var tvs_layers = window.atticData.tvs_layers;
        if (!isChecked) {
            for (var item in st_layers) {
                map.setLayoutProperty(st_layers[item], 'visibility', 'none');
            }
            for (var item in tvs_layers) {
                map.setLayoutProperty(tvs_layers[item], 'visibility', 'none');
            }
        } else if (isChecked) {
            for (var item in st_layers) {
                map.setLayoutProperty(st_layers[item], 'visibility', 'visible');
            }
            for (var item in tvs_layers) {
                map.setLayoutProperty(tvs_layers[item], 'visibility', 'visible');
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

    armFunctions.toggleswitchFunctions($('#armrSTVisBtnSwitchElem'), function() {
        var stormTrackLayers = window.atticData.stormTrackLayers;
        if (stormTrackLayers != undefined) {
            for (var i in stormTrackLayers) {
                if (map.getLayer(stormTrackLayers[i])) {
                    map.setLayoutProperty(stormTrackLayers[i], 'visibility', 'visible');
                }
            }
        }
    }, function() {
        var stormTrackLayers = window.atticData.stormTrackLayers;
        if (stormTrackLayers != undefined) {
            for (var i in stormTrackLayers) {
                if (map.getLayer(stormTrackLayers[i])) {
                    map.setLayoutProperty(stormTrackLayers[i], 'visibility', 'none');
                }
            }
        }
    })

    armFunctions.toggleswitchFunctions($('#armrRoadsStreetsVisBtnSwitchElem'), function() {
        setBaseMapLayers('both');
        setLayerOrder();
    }, function() {
        setBaseMapLayers('cities');
        setLayerOrder();
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