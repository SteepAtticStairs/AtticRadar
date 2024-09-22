const ut = require('../core/utils');
const load_images = require('./load_images');
const pako = require('pako');
const Papa = require('papaparse');
const metar_station_info = require('./data/metar_station_info');
var map = require('../core/map/map');

const metar_info_lookup = Papa.parse(metar_station_info, {
    header: true,
    dynamicTyping: true,
}).data;
function _get_metar_station_info(station_id) {
    const result = metar_info_lookup.find(obj => obj.station_id === station_id);
    return result;
}

function xhrGzipFile(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.addEventListener('load', function () {
        cb(this.response);
    })
    xhr.send();
}

function fetchMETARData() {
    // var curStation = $('#dataDiv').data('currentStation');
    // $('#dataDiv').data('currentMetarRadarStation', curStation);

    // var distance = 250000;
    // var distanceMiles = distance / 1609;
    // var stationLat = radarStations[curStation][1];
    // var stationLon = radarStations[curStation][2];

    // var bbx = geolib.getBoundsOfDistance(
    //     { latitude: stationLat, longitude: stationLon },
    //     distance
    // );

    // var minLat = bbx[0].latitude;
    // var minLon = bbx[0].longitude;
    // var maxLat = bbx[1].latitude;
    // var maxLon = bbx[1].longitude;

    //var url = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&minLat=${minLat}&minLon=${minLon}&maxLat=${maxLat}&maxLon=${maxLon}&hoursBeforeNow=3#`;
    //var url = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=~us&hoursBeforeNow=3#`;
    //var url = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&radialDistance=${distanceMiles};${stationLon},${stationLat}&hoursBeforeNow=3#`;
    var url = 'https://aviationweather.gov/data/cache/metars.cache.xml.gz#';
    //var url =  '../resources/USA_Test_METAR.xml';
    var noCacheURL = ut.preventFileCaching(ut.phpProxy + url);
    // console.log(noCacheURL)
    xhrGzipFile(noCacheURL, function(data) {
        var xml = pako.inflate(new Uint8Array(data), { to: 'string' });
        var parsedXMLData = ut.xmlToJson(xml);

        for (var item in parsedXMLData.response.data.METAR) {
            if (parsedXMLData.response.data.METAR[item].hasOwnProperty('latitude')) {
                var stationId = parsedXMLData.response.data.METAR[item].station_id['#text'];
                const current_metar_info = _get_metar_station_info(stationId);
                if (current_metar_info != undefined) {
                    const country = current_metar_info.country;

                    const allowed_countries = ['US', 'PR', 'GU', 'VI', 'AS'];
                    const only_USA = true; // $('#armrUSAMETARSBtnSwitchElem').is(':checked');
                    if (only_USA) {
                        if (!allowed_countries.includes(country)) {
                            delete parsedXMLData.response.data.METAR[item];
                        }
                    }
                } else {
                    // deletes all unknown metar stations not in atticradar's database
                    delete parsedXMLData.response.data.METAR[item];
                }
            }
        }

        load_images(parsedXMLData);
    })
}

module.exports = {
    fetchMETARData
}