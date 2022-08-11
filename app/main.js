var map = require('./map/map');
const ut = require('./utils');
const loaders = require('./loaders');
const tilts = require('./menu/tilts');

const { Level2Radar } = require('../nexrad-level-2-data/src');
const { plot } = require('../nexrad-level-2-plot/src');

const l3parse = require('../nexrad-level-3-data/src');
const l3plot = require('./level3/draw');
const l3info = require('./dom/l3info');

// load the initial four tilts and initiate event listeners
tilts.listTilts([1, 2, 3, 4], function() {
    tilts.tiltEventListeners();
});

$('.productBtnGroup button').on('click', function() {
    if ($('#dataDiv').data('curProd') != this.value) {
        tilts.resetTilts();
    }
    $('#dataDiv').data('curProd', this.value);

    tilts.listTilts(ut.numOfTiltsObj[this.value]);
    var clickedProduct = ut.tiltObject[$('#tiltsDropdownBtn').attr('value')][this.value];
    var currentStation = $('#stationInp').val();
    loaders.getLatestFile(currentStation, [3, clickedProduct], function(url) {
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
            plot(l2rad, 'REF', {
                elevations: 1,
            });
        } else if (fileLevel == 3) {
            var l3rad = l3parse(ut.toBuffer(this.result));
            console.log(l3rad);

            l3info(l3rad);
            l3plot(l3rad);
        }
    }, false);
    reader.readAsArrayBuffer(uploadedFile);
})