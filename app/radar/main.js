var map = require('./map/map');
const ut = require('./utils');
const loaders = require('./loaders');
const tilts = require('./menu/tilts');

const mainL3Loading = require('./level3/main');
const mainL2Loading = require('./level2/main');

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

// add the reload control
require('./map/controls/reload');

var startTimer = Date.now();
$.get(ut.phpProxy + "https://google.com", function(data) {
    var endTimer = Date.now();
    console.log(`Established connection to proxy in ${endTimer - startTimer} ms`)
})

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
            mainL2Loading(this);
        } else if (fileLevel == 3) {
            mainL3Loading(this);
        }
    }, false);
    reader.readAsArrayBuffer(uploadedFile);
})