const createOffCanvasItem = require('./createOffCanvasItem');
const ut = require('../utils');
const map = require('../map/map');

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
})