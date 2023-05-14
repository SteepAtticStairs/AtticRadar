const unzipKMZ = require('./unzip');
const ut = require('../core/utils');
const drawOutlookToMap = require('./drawOutlooks');
var map = require('../core/map/map');

// https://www.nhc.noaa.gov/storm_graphics/api/AL052022_CONE_latest.kmz
// https://www.nhc.noaa.gov/storm_graphics/api/AL052022_TRACK_latest.kmz
// https://www.nhc.noaa.gov/gis/
// https://www.nhc.noaa.gov/aboutrss.shtml

// https://www.nrlmry.navy.mil/atcf_web/docs/database/new/database.html
// https://www.nrlmry.navy.mil/atcf_web/docs/current_storms/

// https://github.com/weather-gov/api/discussions/569

function loadOutlooks() {
    function loadOutlookFromFile(url, name) {
        if (url.startsWith("https")) {
            url = ut.phpProxy + url;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.addEventListener('load', function () {
            var response = xhr.response;
            var blob = response;

            blob.lastModifiedDate = new Date();
            blob.name = url;

            unzipKMZ(blob, name, function(geoJsonObject) {
                drawOutlookToMap(geoJsonObject, name);
                //drawOutlookToMap(geoJsonObject, 'track', name);
            });
        });
        xhr.send();
    }

    var urls = [
        ut.preventFileCaching(`https://www.nhc.noaa.gov/xgtwo/gtwo_atl.kmz#`),
        ut.preventFileCaching(`https://www.nhc.noaa.gov/xgtwo/gtwo_pac.kmz#`),
        ut.preventFileCaching(`https://www.nhc.noaa.gov/xgtwo/gtwo_cpac.kmz#`),
    ]
    var names = ['atl', 'pac', 'cpac'];
    for (var x in urls) {
        loadOutlookFromFile(urls[x], `${names[x]}Outlook`)
        //loadOutlookFromFile(urls[x], 'track', 'pacOutlook')
    }
}

module.exports = loadOutlooks;