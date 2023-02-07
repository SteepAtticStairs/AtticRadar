const ut = require('../utils');
const loaders = require('../loaders');
const { DateTime } = require('luxon');
const initStormTracks = require('../level3/stormTracking/fetchData');

var oldURL = '';
var oldOptions = '';

function autoUpdate(options) {
    var station = options.station;
    var product = options.product;

    function checkLatestFile() {
        initStormTracks.initStormTracks();
        loaders.getLatestFile(station, [3, product, 0], function(url) {
            var formattedNow = DateTime.now().toFormat('h:mm.ss a ZZZZ');

            // don't load a "new file" if this is the first time running the script -
            // the user has just clicked on the station marker
            if (oldURL == '') { oldURL = url }
            // don't load a "new file" if the station or product has changed - 
            // this will make the new url different than the old url but it's not a new file
            if (oldOptions != options) {
                oldOptions = options;
                oldURL = url;
            }

            if (url != oldURL) {
                oldURL = url;
                console.log(`Successfully found new radar scan at ${formattedNow}.`);
                loaders.loadFileObject(ut.phpProxy + url + '#', 3);
            } else {
                console.log(`There is no new radar scan as of ${formattedNow}.`);
            }
        })
    }

    if (window.radarRefreshInterval) { clearInterval(window.radarRefreshInterval) }
    checkLatestFile();
    // check for a new radar scan every 15 seconds
    window.radarRefreshInterval = setInterval(checkLatestFile, 15000);
}

module.exports = autoUpdate;