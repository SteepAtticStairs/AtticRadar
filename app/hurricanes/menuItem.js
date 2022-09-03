const ut = require('../radar/utils');
const createMenuOption = require('../radar/menu/createMenuOption');
var map = require('../radar/map/map');

function loadHurricanesControl(layerArray) {
    createMenuOption({
        'id': 'hurricanesMenuItem',
        'class': 'alert alert-primary offCanvasMenuItem',
        'contents': 'Hurricane Tracker',
        'icon': 'fa fa-hurricane',
        'css': ''
    }, function (thisObj, innerDiv, iconElem) {
        if (!$(thisObj).hasClass('alert-primary')) {
            $(thisObj).removeClass('alert-secondary');
            $(thisObj).addClass('alert-primary');

            for (var i = 0; i < layerArray.length; i++) {
                map.setLayoutProperty(layerArray[i], 'visibility', 'visible');
            }
        } else if ($(thisObj).hasClass('alert-primary')) {
            $(thisObj).removeClass('alert-primary');
            $(thisObj).addClass('alert-secondary');

            for (var i = 0; i < layerArray.length; i++) {
                map.setLayoutProperty(layerArray[i], 'visibility', 'none');
            }
        }
    })
    // insert the hurricanes menu item after the tide stations menu item
    if ($("#tideStationMenuItem_outer").length) {
        $("#tideStationMenuItem_outer").insertAfter("#hurricanesMenuItem_outer");
    }
}

module.exports = {
    loadHurricanesControl
};