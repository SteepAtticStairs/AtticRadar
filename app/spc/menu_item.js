const map = require('../core/map/map');
const armFunctions = require('../core/menu/atticRadarMenu');
const fetch_spc_data = require('./fetch_data');

function _hide_layers() {
    if (map.getLayer('spc_fill')) {
        // map.setLayoutProperty('spc_fill', 'visibility', 'none');
        // map.setLayoutProperty('spc_border', 'visibility', 'none');
        map.removeLayer('spc_fill');
        map.removeLayer('spc_border');
        map.removeSource('spc_source');
    }
}

armFunctions.toggleswitchFunctions($('#armrSPC_day1_cat_BtnSwitchElem'),
function() { fetch_spc_data('day1', 'convective', 'categorical'); },
function() { _hide_layers(); })

armFunctions.toggleswitchFunctions($('#armrSPC_day1_fire_BtnSwitchElem'),
function() { fetch_spc_data('day1', 'fire', 'windrh'); },
function() { _hide_layers(); })