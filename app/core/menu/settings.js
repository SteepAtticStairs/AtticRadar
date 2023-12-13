const ut = require('../utils');
const map = require('../map/map');
const terminator = require('../map/terminator/terminator');
const armFunctions = require('./atticRadarMenu');
const setLayerOrder = require('../map/setLayerOrder');
const fetchMETARData = require('../../metars/fetch_data');
const fetch_alerts_data = require('../../alerts/fetch_data');
const fetch_spc_data = require('../../spc/fetch_data');
const change_map_style = require('../map/styles');

const divElem = '#settingsItemDiv';
const iconElem = '#settingsItemClass';

$(iconElem).on('click', function() {
    //$('#settingsModalTrigger').click();
    armFunctions.showARMwindow();

    $('#atticRadarMenuSettingsScreen').hide();
    $('#atticRadarMenuSPCScreen').hide();
    $('#atticRadarMenuMainScreen').show();
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
    if (map.getLayer('station_range_layer')) {
        map.setLayoutProperty('station_range_layer', 'visibility', 'visible');
    }
}, function() {
    if (map.getLayer('baseReflectivity')) {
        map.setLayoutProperty('baseReflectivity', 'visibility', 'none');
    }
    if (map.getLayer('station_range_layer')) {
        map.setLayoutProperty('station_range_layer', 'visibility', 'none');
    }
})

armFunctions.toggleswitchFunctions($('#armrLightningVisBtnSwitchElem'), function() {
    if (map.getLayer('lightningLayer')) {
        map.setLayoutProperty('lightningLayer', 'visibility', 'visible');
    }
}, function() {
    if (map.getLayer('lightningLayer')) {
        map.setLayoutProperty('lightningLayer', 'visibility', 'none');
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

$('.map_style_button').click(function() {
    $('.map_style_button').not(this).each(function() { this.checked = false; })
})
armFunctions.toggleswitchFunctions($('#armrSatelliteMapBtnSwitchElem'), function() { change_map_style('satellite'); })
armFunctions.toggleswitchFunctions($('#armrLightMapBtnSwitchElem'), function() { change_map_style('light'); })
armFunctions.toggleswitchFunctions($('#armrDarkMapBtnSwitchElem'), function() { change_map_style('dark'); })

function _reload_alerts() {
    if ($('#alertMenuItemIcon').hasClass('icon-blue')) {
        fetch_alerts_data._fetch_data();
    }
}
armFunctions.toggleswitchFunctions($('#armrWarningsBtnSwitchElem'), _reload_alerts, _reload_alerts);
armFunctions.toggleswitchFunctions($('#armrWatchesBtnSwitchElem'), _reload_alerts, _reload_alerts);
armFunctions.toggleswitchFunctions($('#armrStatementsBtnSwitchElem'), _reload_alerts, _reload_alerts);

armFunctions.toggleswitchFunctions($('#armrHurricaneLegendVisBtnSwitchElem'), function() {
    const is_hurricanes_enabled = $('#armrHurricanesBtnSwitchElem').is(':checked');
    if (is_hurricanes_enabled) {
        $('#hurricaneLegendDiv').show();
    }
}, function() {
    const is_hurricanes_enabled = $('#armrHurricanesBtnSwitchElem').is(':checked');
    if (is_hurricanes_enabled) {
        $('#hurricaneLegendDiv').hide();
    }
})

// armFunctions.toggleswitchFunctions($('#armrUSAMETARSSwitchElem'), function() {
//     fetchMETARData.fetchMETARData();
// }, function() {
//     fetchMETARData.fetchMETARData();
// })

// this is in app/alerts/drawAlertShapes.js
//$('#showExtraAlertPolygonsCheckbox').on('click', function() {})

// armFunctions.toggleswitchFunctions($('#armrSPCOutlooksVisBtnSwitchElem'), function() {
//     if (map.getLayer('spc_fill')) {
//         map.setLayoutProperty('spc_fill', 'visibility', 'visible');
//         map.setLayoutProperty('spc_border', 'visibility', 'visible');
//     } else {
//         fetch_spc_data();
//     }
// }, function() {
//     if (map.getLayer('spc_fill')) {
//         map.setLayoutProperty('spc_fill', 'visibility', 'none');
//         map.setLayoutProperty('spc_border', 'visibility', 'none');
//     }
// })