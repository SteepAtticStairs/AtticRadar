const l3parse = require('../../../lib/nexrad-level-3-data/src');
const l3plot = require('../level3/draw');
const l3info = require('../dom/l3info');
const distanceMeasure = require('../distance/distanceMeasure');
const stationAbbreviations = require('../../../resources/stationAbbreviations');
const radarStations = require('../../../resources/radarStations');
const turf = require('@turf/turf');

var map = require('../map/map');

const parsePlotTornado = require('../level3/stormTracking/tornadoVortexSignature');
const parsePlotMesocyclone = require('../level3/stormTracking/mesocycloneDetection');
const parsePlotStormTracks = require('../level3/stormTracking/stormTracks');

const ut = require('../utils');

function mainL3Loading(thisObj) {
    // just to have a consistent starting point
    //ut.progressBarVal('set', 120);
    var dividedArr = ut.getDividedArray(ut.progressBarVal('getRemaining'));

    var result = thisObj.result;
    setTimeout(function() {
        // parsing the file
        ut.betterProgressBar('set', 70);
        var l3rad = l3parse(ut.toBuffer(result));
        console.log(l3rad);

        $('#dataDiv').data('radarGeoData', {
            'height': l3rad.productDescription.height,
            'station': stationAbbreviations[l3rad.textHeader.id3],
            'lat': l3rad.productDescription.latitude,
            'lon': l3rad.productDescription.longitude
        });

        ut.colorLog(new Date(l3rad.messageHeader.seconds * 1000).toLocaleString('en-US', { timeZone: 'America/New_York' }).slice(10), 'green')
        // completed parsing
        ut.progressBarVal('label', 'File parsing complete');
        ut.progressBarVal('set', dividedArr[0] * 2);

        var product = l3rad.textHeader.type;
        if (product != 'NTV' && product != 'NMD' && product != 'NST') {
            // display file info, but not if it is storm tracks
            l3info(l3rad);
        }
        // plot the file
        ut.betterProgressBar('set', 90);

        if (l3rad.textHeader.type == "NTV") {
            parsePlotTornado(l3rad, document.getElementById('radarStation').innerHTML);
        } else if (l3rad.textHeader.type == "NMD") {
            parsePlotMesocyclone(l3rad, document.getElementById('radarStation').innerHTML);
        } else if (l3rad.textHeader.type == "NST") {
            parsePlotStormTracks(l3rad, document.getElementById('radarStation').innerHTML);
        } else {
            var fileElevation = l3rad.productDescription.elevationAngle;
            console.log(fileElevation)
            if (fileElevation == undefined) {
                fileElevation = l3rad.productDescription.elevationNumber;
            }
            $('#extraProductInfo').show().html(`Elevation: ${fileElevation}°`);

            l3plot(l3rad);
        }

        // $(document).keyup(function(event) {
        //     if (event.which === 13) {
        //         l3plot(l3rad);
        //     }
        // });
    }, 500)
}

module.exports = mainL3Loading;