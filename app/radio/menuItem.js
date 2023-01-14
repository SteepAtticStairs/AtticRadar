const createToolsOption = require('../radar/menu/createToolsOption');
const plotToMap = require('./plotToMap');
var map = require('../radar/map/map');

function weatherRadioToolsOption(index) {
    createToolsOption({
        'divId': 'weatherstationItemDiv',
        'iconId': 'weatherstationItemClass',

        'index': index,

        'divClass': 'mapFooterMenuItem',
        'iconClass': 'icon-grey',

        'contents': 'Weather Radio Tool',
        'icon': 'fa fa-radio',
        'css': ''
    }, function(divElem, iconElem) {
        if (!$(iconElem).hasClass('icon-blue')) {
            $(iconElem).addClass('icon-blue');
            $(iconElem).removeClass('icon-grey');

            if (map.getLayer('radioStationLayer')) {
                // layer does exist - toggle the visibility to on
                map.setLayoutProperty('radioStationLayer', 'visibility', 'visible');
            } else {
                // layer doesn't exist - load it onto the map for the first time
                plotToMap();
            }
        } else if ($(iconElem).hasClass('icon-blue')) {
            $(iconElem).removeClass('icon-blue');
            $(iconElem).addClass('icon-grey');

            // layer does exist - toggle the visibility to off
            map.setLayoutProperty('radioStationLayer', 'visibility', 'none');
        }
    })
}

module.exports = {
    weatherRadioToolsOption
}