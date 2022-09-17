const ut = require('../radar/utils');
const useData = require('./useData');
var map = require('../radar/map/map');

const radarStations = require('../../resources/radarStations');

function fetchMETARData(action) {
    var curStation = $('#dataDiv').data('currentStation');
    $('#dataDiv').data('currentMetarRadarStation', curStation);
    var bbx = geolib.getBoundsOfDistance(
        { latitude: radarStations[curStation][1], longitude: radarStations[curStation][2] },
        250000
    );

    var minLat = bbx[0].latitude;
    var minLon = bbx[0].longitude;
    var maxLat = bbx[1].latitude;
    var maxLon = bbx[1].longitude;

    var url = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&minLat=${minLat}&minLon=${minLon}&maxLat=${maxLat}&maxLon=${maxLon}&hoursBeforeNow=3#`;
    var noCacheURL = ut.preventFileCaching(ut.phpProxy2 + url);
    $.get(noCacheURL, function(data) {
        var parsedXMLData = ut.xmlToJson(data);

        useData.useData(parsedXMLData, action);
    })
}

module.exports = {
    fetchMETARData
}