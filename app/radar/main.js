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
require('./menu/mode');
//require('./map/controls/mode');

// load the station marker menu item
require('./menu/stationMarkerMenu');

// add the reload control
require('./map/controls/reload');

// add the help control
require('./map/controls/help/helpControl');

// add the menu control
//require('./map/controls/offCanvasMenu');

if (require('./misc/detectmobilebrowser')) {
    $('#mapFooter').css("height", "+=20px");
    $('#mapFooter').css("align-items", "start");
}

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


// const aeris = new AerisWeather('AcxJ7pqDEeRA8kcDUOTPS', '7tOA7yRcLFb40YCCoXq0ccUMtD4ZZJarCgNjOrtL');

// const request = aeris.api()
//     .endpoint('lightning')
//     .place('79034')
//     .format('json')
//     .filter('cg')
//     .limit(100000);
// request.get().then((result) => {
//     for (var i = 0; i < result.data.length; i++) {
//         var lng = result.data[i].loc.long;
//         var lat = result.data[i].loc.lat;
//         new mapboxgl.Marker()
//             .setLngLat([lng, lat])
//             .addTo(map);
//     }
// });