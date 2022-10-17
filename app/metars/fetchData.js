const ut = require('../radar/utils');
const useData = require('./useData');
var map = require('../radar/map/map');

const radarStations = require('../../resources/radarStations');

function fetchMETARData(action) {
    var curStation = $('#dataDiv').data('currentStation');
    $('#dataDiv').data('currentMetarRadarStation', curStation);

    var distance = 250000;
    var distanceMiles = distance / 1609;
    var stationLat = radarStations[curStation][1];
    var stationLon = radarStations[curStation][2];

    var bbx = geolib.getBoundsOfDistance(
        { latitude: stationLat, longitude: stationLon },
        distance
    );

    var minLat = bbx[0].latitude;
    var minLon = bbx[0].longitude;
    var maxLat = bbx[1].latitude;
    var maxLon = bbx[1].longitude;

    //var url = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&minLat=${minLat}&minLon=${minLon}&maxLat=${maxLat}&maxLon=${maxLon}&hoursBeforeNow=3#`;
    //var url = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=~us&hoursBeforeNow=3#`;
    //var url = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&radialDistance=${distanceMiles};${stationLon},${stationLat}&hoursBeforeNow=3#`;
    var url = 'https://www.aviationweather.gov/adds/dataserver_current/current/metars.cache.xml#';
    //var url =  '../resources/USA_Test_METAR.xml';
    var noCacheURL = ut.preventFileCaching(ut.phpProxy2 + url);
    $.get(noCacheURL, function(data) {
        var parsedXMLData = ut.xmlToJson(data);

        useData.useData(parsedXMLData, action);
    })
}

module.exports = {
    fetchMETARData
}