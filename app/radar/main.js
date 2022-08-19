var map = require('./map/map');
const ut = require('./utils');
const loaders = require('./loaders');
const tilts = require('./menu/tilts');

const { Level2Radar } = require('../../nexrad-level-2-data/src');
const { plot } = require('../../nexrad-level-2-plot/src');
const l2listeners = require('./level2/eventListeners');
const l2info = require('./dom/l2info');

const l3parse = require('../../nexrad-level-3-data/src');
const l3plot = require('./level3/draw');
const l3info = require('./dom/l3info');

const parsePlotTornado = require('./level3/stormTracking/tornadoVortexSignature');
const parsePlotMesocyclone = require('./level3/stormTracking/mesocycloneDetection');
const parsePlotStormTracks = require('./level3/stormTracking/stormTracks');

// load the initial four tilts and initiate event listeners
tilts.listTilts([1, 2, 3, 4], function() {
    tilts.tiltEventListeners();
});

// initially hide the progress bar
ut.progressBarVal('hide');

// add file upload listeners
require('./dom/fileUpload');

// load the mode control
require('./map/controls/mode');

$('.productBtnGroup button').on('click', function() {
    ut.disableModeBtn();
    ut.progressBarVal('set', 0);
    if ($('#dataDiv').data('curProd') != this.value) {
        tilts.resetTilts();
        tilts.listTilts(ut.numOfTiltsObj[this.value]);
    }
    $('#dataDiv').data('curProd', this.value);
    var clickedProduct = ut.tiltObject[$('#tiltsDropdownBtn').attr('value')][this.value];
    var currentStation = $('#stationInp').val();
    loaders.getLatestFile(currentStation, [3, clickedProduct, 0], function(url) {
        console.log(url);
        loaders.loadFileObject(ut.phpProxy + url, 3);
    })
})

document.addEventListener('loadFile', function(event) {
    var uploadedFile = event.detail[0];
    var fileLevel = event.detail[1];
    var wholeOrPart = event.detail[2];
    const reader = new FileReader();

    reader.addEventListener("load", function () {
        if (fileLevel == 2 || fileLevel == 22) {
            var l2rad = new Level2Radar(ut.toBuffer(this.result));
            console.log(l2rad);
            l2info(l2rad);
            plot(l2rad, 'REF', {
                elevations: 1,
            });
            l2listeners(l2rad);
        } else if (fileLevel == 3) {
            // just to have a consistent starting point
            //ut.progressBarVal('set', 120);
            var dividedArr = ut.getDividedArray(ut.progressBarVal('getRemaining'));

            var result = this.result;
            setTimeout(function() {
                // parsing the file
                ut.progressBarVal('label', 'Parsing file');
                ut.progressBarVal('add', dividedArr[0] * 1);
                var l3rad = l3parse(ut.toBuffer(result));
                console.log(l3rad);
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
                ut.progressBarVal('label', 'Plotting file');
                ut.progressBarVal('set', dividedArr[0] * 3);

                if (l3rad.textHeader.type == "NTV") {
                    parsePlotTornado(l3rad, document.getElementById('radarStation').innerHTML);
                } else if (l3rad.textHeader.type == "NMD") {
                    parsePlotMesocyclone(l3rad, document.getElementById('radarStation').innerHTML);
                } else if (l3rad.textHeader.type == "NST") {
                    parsePlotStormTracks(l3rad, document.getElementById('radarStation').innerHTML);
                } else {
                    const level3Plot = l3plot(l3rad);
                }
                l3plot(l3rad);
            }, 500)
        }
    }, false);
    reader.readAsArrayBuffer(uploadedFile);
})