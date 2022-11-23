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

// load the tools menu
require('./menu/tools');

// load the data inspector tool
require('./inspector/entry');

// load the offcanvas menu control
require('./map/controls/offCanvasMenu');

// load the offcanvas settings control
require('./menu/settings');
$('#dataDiv').data('stormTracksVisibility', true);

// load the station marker menu item
require('./menu/stationMarkerMenu');

// load the radar message listener
require('./radarMessage/radarMessage');

// load the historical hurricanes module
require('../hurricanes/historical/menuItem');

// add the help control
require('./map/controls/help/helpControl');

// add the menu control
//require('./map/controls/offCanvasMenu');

$('#dataDiv').data('currentStation', 'KLWX');

$('#haClearMap').on('mouseenter', function() {
    ut.animateBrightness(100, 80, 100, $('#haClearMapOuter'));
})
$('#haClearMap').on('mouseleave', function() {
    ut.animateBrightness(80, 100, 100, $('#haClearMapOuter'));
})

$('#haDatePicker').datepicker({
    format: "yyyy",
    viewMode: "years", 
    minViewMode: "years",
    autoclose: true,
    startDate: new Date(new Date().setFullYear(1851)),
    endDate: new Date(new Date().setFullYear(2021))
})

var haStormNameDropdown = new bootstrap.Dropdown($('#haStormNameDropdown'));
haStormNameDropdown.show();

ut.setMapMargin('bottom', $('#mapFooter').height());
ut.setMapMargin('top', $('#radarHeader').height());

if (require('./misc/detectmobilebrowser')) {
    //$('#mapFooter').css("height", "+=20px");
    var div = document.createElement('div');
    div.className = 'mapFooter';
    $(div).css("z-index", $('#mapFooter').css("z-index") - 1);
    document.body.appendChild(div);

    $('#mapFooter').css('bottom', '5%');
    var offset = $(window).height() * (5 / 100);
    ut.setMapMargin('bottom', offset + $('#mapFooter').height());
    // $('#colorPicker').css('bottom', offset);
    // $('#colorPickerText').css('bottom', offset);
    //$('#mapFooter').css("align-items", "start");
}

//$('#productMapFooter').hide();

var startTimer = Date.now();
$.get(ut.phpProxy + "https://google.com", function(data) {
    var endTimer = Date.now();
    console.log(`Established connection to main proxy in ${endTimer - startTimer} ms`)
})

// var startTimer2 = Date.now();
// $.get(ut.phpProxy2 + "https://google.com", function(data) {
//     var endTimer2 = Date.now();
//     console.log(`Established connection to backup proxy in ${endTimer2 - startTimer2} ms`)
// })

//$('#productsDropdownBtn').click();
$('#productsDropdownTrigger').on('click', function(e) {
    $('#productsDropdown').css('bottom', parseInt($('#map').css('bottom')) + 5);
    var bsDropdownClass = new bootstrap.Dropdown($('#productsDropdown'));

    if (!bsDropdownClass._isShown()) {
        bsDropdownClass.show();
        document.body.addEventListener('click', function(e) {
            // if the click target is the map
            if ($(e.target).prop("tagName") == 'CANVAS') {
                bsDropdownClass.hide();
            }
        });
    } else {
        bsDropdownClass.hide();
    }
})

$('#wsr88dMenu').show();
$('#tdwrMenu').hide();

$(".productOption").on('click', function() {
    document.getElementById('productsDropdownTriggerText').innerHTML = this.innerHTML;
    //$('.selectedProduct').removeClass('selectedProduct');
    //$(this).addClass('selectedProduct')
    var thisInnerHTML = $(this).html();
    $('.selectedProductMenuItem').remove();
    $(this).html(`<i class="fa-solid fa-circle-check icon-green selectedProductMenuItem">&nbsp;&nbsp;</i>${thisInnerHTML}`);

    var thisValue = $(this).attr('value');
    $('#productsDropdownTriggerText').html(window.longProductNames[thisValue]);

    ut.disableModeBtn();
    ut.progressBarVal('set', 0);
    if ($('#dataDiv').data('curProd') != thisValue) {
        tilts.resetTilts();
        tilts.listTilts(ut.numOfTiltsObj[thisValue]);
    }
    $('#dataDiv').data('curProd', thisValue);
    var clickedProduct = ut.tiltObject[$('#dataDiv').data('curTilt')][thisValue];
    var currentStation = $('#stationInp').val();
    loaders.getLatestFile(currentStation, [3, clickedProduct, 0], function(url) {
        console.log(url);
        loaders.loadFileObject(ut.phpProxy + url + '#', 3);
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

// setTimeout(function() {
//     if (map.loaded()) {
//         //$('#stationMenuItemIcon').click();
//         loaders.loadFileObject('../data/KTLX20130520_201643_V06.gz#', 2);
//     } else {
//         map.on('load', function() {
//             //$('#stationMenuItemIcon').click();
//             loaders.loadFileObject('../data/KTLX20130520_201643_V06.gz#', 2);
//         })
//     }
// }, 0)


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