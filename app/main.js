//const fetch = require('node-fetch');
const { Level2Radar } = require('../nexrad-level-2-data/src');
const Level3Radar = require('../nexrad-level-3-data/src');
const { plot } = require('../nexrad-level-2-plot/src');
const { map } = require('../nexrad-level-2-plot/src/draw/palettes/hexlookup');

const fs = require('fs');
const { plotAndData, writePngToFile } = require('../nexrad-level-3-plot/src');

const ut = require('./utils');

const l3plot = require('./level3/draw');
const loadL2Listeners = require('./level2/eventListeners');

const parsePlotTornado = require('./level3/tornadoVortexSignature');
const parsePlotMesocyclone = require('./level3/mesocycloneDetection');
const parsePlotStormTracks = require('./level3/stormTracks');

// run main code (used to be in the index.html)
require('./index');

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
document.getElementById('fileInput').addEventListener('input', function() {
    // Create the event
    var event = new CustomEvent("loadFile", { "detail": [
        document.getElementById('fileInput').files[0],
        'level2'
    ] });
    // Dispatch/Trigger/Fire the event
    document.dispatchEvent(event);
})

setTimeout(function() {
    //const file = fs.readFileSync('./data/level3/LWX_HHC_2022_04_18_15_21_24');
    //const level3Plot = plotAndData(file);
}, 1000)

if (require('./misc/detectmobilebrowser')) {
    console.log('yup, its mobile');
    document.getElementById('level2btns').style.display = 'none';
} else {
    console.log('nope, not mobile');
}

document.addEventListener('loadFile', function(event) {
    //logToModal('starting')
    document.getElementById('spinnerParent').style.display = 'block';
    document.getElementById('productStuff').style.display = 'block';
    document.getElementById('levelInput').style.display = 'none';
    //removeTestFileControl();
    //console.log(URL.createObjectURL(document.getElementById("fileInput").files[0]));
    setTimeout(function() {
        var uploadedFile = event.detail[0];
        var fileLevel = event.detail[1];
        const reader = new FileReader();

        reader.addEventListener("load", function () {
            console.log('file uploaded, parsing now');
            if (fileLevel == 'level2') {
                var wholeOrPart = event.detail[2];
                document.getElementById('elevStuff').style.display = 'block';
                document.getElementById('extraStuff').style.display = 'block';
                var l2rad = new Level2Radar(ut.toBuffer(this.result), {wholeOrPart})
                console.log(l2rad)
                var theFileVersion = l2rad.header.version;
                document.getElementById('fileVersion').innerHTML = theFileVersion;

                // older file versions only have reflectivity and velocity data - check for that here
                if (theFileVersion == "06") {
                    document.getElementById('productInput').add(new Option('Reflectivity', 'REF'));
                    document.getElementById('productInput').add(new Option('Velocity', 'VEL'));
                    document.getElementById('productInput').add(new Option('Correlation Coefficient', 'RHO'));
                    document.getElementById('productInput').add(new Option('Differential Phase Shift', 'PHI'));
                    document.getElementById('productInput').add(new Option('Differential Reflectivity', 'ZDR'));
                    document.getElementById('productInput').add(new Option('Spectrum Width', 'SW '));
                } else {
                    document.getElementById('productInput').add(new Option('Reflectivity', 'REF'));
                    document.getElementById('productInput').add(new Option('Velocity', 'VEL'));
                }

                function displayElevations(displayedProduct) {
                    $('#elevInput').empty();
                    var elevs = l2rad.listElevations();
                    var elevAngles = l2rad.listElevations('angle', l2rad);
                    const preferredWaveformUsage = {
                        1: ['REF', 'ZDR', 'PHI', 'RHO'],
                        2: ['VEL'],
                        3: ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'],
                        4: ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'],
                        5: ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'],
                    };
                    for (var key in elevAngles) {
                        if (theFileVersion == "06") {
                            if (preferredWaveformUsage[elevAngles[key][1]].includes(displayedProduct)) {
                                document.getElementById('elevInput').add(new Option(ut.round(elevAngles[key][0], 1), elevs[key]));
                            }
                        } else {
                            if (elevAngles[key][1].includes(displayedProduct)) {
                                document.getElementById('elevInput').add(new Option(ut.round(elevAngles[key][0], 1), elevs[key]));
                            }
                        }
                    }
                }
                //var blob = new Blob([JSON.stringify(l2rad)], {type: "text/plain"});
                //var url = window.URL.createObjectURL(blob);
                //document.getElementById('decodedRadarDataURL').innerHTML = url;
                //showPlotBtn();
                //document.getElementById('plotRef').style.display = 'inline';
                //document.getElementById('plotVel').style.display = 'inline';
                document.getElementById('fileInput').style.display = 'none';
                document.getElementById('radarInfoDiv').style.display = 'inline';

                document.getElementById('radFileName').innerHTML = uploadedFile.name;

                var theFileStation = l2rad.header.ICAO;
                document.getElementById('radStation').innerHTML = theFileStation;

                var theFileVCP;
                if (!(theFileVersion == "01")) {
                    theFileVCP = l2rad.vcp.record.pattern_number;
                } else {
                    theFileVCP = l2rad.data[1][0].record.vcp;
                }
                document.getElementById('radVCP').innerHTML = theFileVCP;

                var theFileDate = l2rad.header.modified_julian_date;
                var theFileTime = l2rad.header.milliseconds;
                var fileDateObj = new Date(0).addDays(theFileDate);
                var fileHours = ut.msToTime(theFileTime).hours;
                var fileMinutes = ut.msToTime(theFileTime).minutes;
                var fileSeconds = ut.msToTime(theFileTime).seconds;
                fileDateObj.setUTCHours(fileHours);
                fileDateObj.setUTCMinutes(fileMinutes);
                fileDateObj.setUTCSeconds(fileSeconds);
                var finalRadarDateTime = ut.printFancyTime(fileDateObj, "UTC");

                document.getElementById('radDate').innerHTML = finalRadarDateTime;

                loadL2Listeners(l2rad, displayElevations);
            } else if (fileLevel == 'level3') {
                console.log('level 3 file')
                var l3rad = Level3Radar(ut.toBuffer(this.result))
                console.log(l3rad)

                //showPlotBtn();
                document.getElementById('fileInput').style.display = 'none';
                document.getElementById('radarInfoDiv').style.display = 'inline';

                document.getElementById('radFileName').innerHTML = uploadedFile.name;

                var theFileStation = 'K' + l3rad.textHeader.id3;
                document.getElementById('radStation').innerHTML = theFileStation;

                var theFileVCP = l3rad.productDescription.vcp;
                document.getElementById('radVCP').innerHTML = theFileVCP;

                var theFileDate = l3rad.messageHeader.julianDate;
                var theFileTime = l3rad.messageHeader.seconds * 1000;
                var fileDateObj = new Date(0).addDays(theFileDate);
                var fileHours = ut.msToTime(theFileTime).hours;
                var fileMinutes = ut.msToTime(theFileTime).minutes;
                var fileSeconds = ut.msToTime(theFileTime).seconds;
                fileDateObj.setUTCHours(fileHours);
                fileDateObj.setUTCMinutes(fileMinutes);
                fileDateObj.setUTCSeconds(fileSeconds);
                var finalRadarDateTime = ut.printFancyTime(fileDateObj, "UTC");

                document.getElementById('radDate').innerHTML = finalRadarDateTime;

                if (l3rad.textHeader.type == "NTV") {
                    parsePlotTornado(l3rad, theFileStation);
                } else if (l3rad.textHeader.type == "NMD") {
                    parsePlotMesocyclone(l3rad, theFileStation);
                } else if (l3rad.textHeader.type == "NST") {
                    parsePlotStormTracks(l3rad, theFileStation);
                } else {
                    const level3Plot = l3plot(l3rad);
                }

                //document.getElementById('settingsDialog').innerHTML = 'No settings for Level 3 files yet.'
                if (l3rad.textHeader.type != "NST") {
                    document.getElementById('elevStuff').style.display = 'none';
                }
                document.getElementById('extraStuff').style.display = 'none';
                document.getElementById('spinnerParent').style.display = 'none';
            }
        }, false);
        reader.readAsArrayBuffer(uploadedFile);
    }, 300)
})

/*
document.getElementById('fileThatWorks').addEventListener('click', function() {
    $.ajax({
        url: './data/' + document.getElementById('fileThatWorks').innerHTML,
        method: 'GET',
        xhrFields: { responseType: 'arraybuffer'}
    }).then(function(responseData) {
        //console.clear();
        console.log('loaded ' + document.getElementById('fileThatWorks').innerHTML + ' file from click, reading now')
        var l2rad = new Level2Radar(toBuffer(responseData))
        console.log(l2rad)
    })
})*/

//console.clear();

// https://php-cors-proxy.herokuapp.com/?https://noaa-nexrad-level2.s3.amazonaws.com/2017/08/25/KCRP/KCRP20170825_235733_V06
// https://php-cors-proxy.herokuapp.com/?https://noaa-nexrad-level2.s3.amazonaws.com/2017/08/25/KCRP/KCRP20170825_235733_V06
// https://php-cors-proxy.herokuapp.com/?https://noaa-nexrad-level2.s3.amazonaws.com/2009/06/03/KBLX/KBLX20090603_004417_V03.gz
/*fetch('https://php-cors-proxy.herokuapp.com/?https://noaa-nexrad-level2.s3.amazonaws.com/2017/08/25/KCRP/KCRP20170825_235733_V06')
    .then(res => res.arrayBuffer())
    .then(rawData => {
        var l2rad = new Level2Radar(toBuffer(rawData))
        console.log(l2rad)
    })
    .catch(err => console.error(err));*/