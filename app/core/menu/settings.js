const ut = require('../utils');
const map = require('../map/map');
const terminator = require('../map/terminator/terminator');
const armFunctions = require('./atticRadarMenu');
const setLayerOrder = require('../map/setLayerOrder');
const fetchMETARData = require('../../metars/fetch_data');
const fetch_alerts_data = require('../../alerts/fetch_data');

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

    armFunctions.toggleswitchFunctions($('#armrDayNightLineVisBtnSwitchElem'), function() {
        terminator.toggleVisibility('show');
    }, function() {
        terminator.toggleVisibility('hide');
    })

    function _reload_alerts() {
        if ($('#alertMenuItemIcon').hasClass('icon-blue')) {
            fetch_alerts_data._fetch_data();
        }
    }
    armFunctions.toggleswitchFunctions($('#armrWarningsBtnSwitchElem'), _reload_alerts, _reload_alerts);
    armFunctions.toggleswitchFunctions($('#armrWatchesBtnSwitchElem'), _reload_alerts, _reload_alerts);
    armFunctions.toggleswitchFunctions($('#armrStatementsBtnSwitchElem'), _reload_alerts, _reload_alerts);
    armFunctions.toggleswitchFunctions($('#armrAdvisoriesBtnSwitchElem'), _reload_alerts, _reload_alerts);

    // armFunctions.toggleswitchFunctions($('#armrUSAMETARSSwitchElem'), function() {
    //     fetchMETARData.fetchMETARData();
    // }, function() {
    //     fetchMETARData.fetchMETARData();
    // })

    // this is in app/alerts/drawAlertShapes.js
    //$('#showExtraAlertPolygonsCheckbox').on('click', function() {})
}

module.exports = {
    settingsOption
};