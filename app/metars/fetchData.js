const ut = require('../radar/utils');
const useData = require('./useData');

function fetchMETARData() {
    var url = 'https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=stations&requestType=retrieve&format=xml&stationString=~us#';
    var noCacheURL = ut.preventFileCaching(ut.phpProxy2 + url);
    $.get(noCacheURL, function(data) {
        var parsedXMLData = ut.xmlToJson(data);
        useData.useData(parsedXMLData);
    })
}

module.exports = {
    fetchMETARData
}