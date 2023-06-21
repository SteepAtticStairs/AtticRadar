const fetchData = require('./fetch_data');
const ut = require('../core/utils');
const armFunctions = require('../core/menu/atticRadarMenu');

$('#armrAtticStationBtn').click(function() {
    ut.loadingSpinner(true);
    fetchData();
    armFunctions.hideARMwindow();
})