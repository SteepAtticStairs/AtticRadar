const fetchData = require('./fetch_data');
const ut = require('../core/utils');
const armFunctions = require('../core/menu/atticRadarMenu');

function weatherstationToolsOption(index) {
    $('#armrAtticStationBtn').click(function() {
        ut.loadingSpinner(true);
        fetchData();
        armFunctions.hideARMwindow();
    })
    // createToolsOption({
    //     'divId': 'weatherstationItemDiv',
    //     'iconId': 'weatherstationItemClass',

    //     'index': index,

    //     'divClass': 'mapFooterMenuItem',
    //     'iconClass': 'icon-grey',

    //     'contents': 'Weather Station Tool',
    //     'icon': 'fa fa-tower-broadcast',
    //     'css': ''
    // }, function(divElem, iconElem) {
    //     if (!$(iconElem).hasClass('icon-blue')) {
    //         $(iconElem).addClass('icon-blue');
    //         $(iconElem).removeClass('icon-grey');
    //     }
    //     ut.loadingSpinner(true);
    //     fetchData(iconElem);
    //     // if (!$(iconElem).hasClass('icon-blue')) {
    //     //     $(iconElem).addClass('icon-blue');
    //     //     $(iconElem).removeClass('icon-grey');

    //     //     fetchData();
    //     // } else if ($(iconElem).hasClass('icon-blue')) {
    //     //     $(iconElem).removeClass('icon-blue');
    //     //     $(iconElem).addClass('icon-grey');

    //     //     distanceMeasure.disableDistanceMeasure();
    //     // }
    // })
}

module.exports = {
    weatherstationToolsOption
}