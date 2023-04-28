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

// initialize the "atticData" global variable,
// which will store data that can be accessed globally
window.atticData = {};

// initially hide the progress bar
ut.progressBarVal('hide');

// add file upload MENU listeners
require('./upload/upload_menu');

// load the mode control
require('./menu/mode');
//require('./map/controls/mode');

// load the atticRadarMenu helper file
require('./menu/atticRadarMenu');

// load the productSelectionMenu helper file
require('./menu/productSelectionMenu');

// load the settings menu
require('./menu/settings').settingsOption();

// load the weather-station menu item
require('../weather-station/menuItem').weatherstationToolsOption();

// load the radio menu item
require('../radio/menuItem').weatherRadioToolsOption();

// load the lightning module
require('../lightning/menu_item');

// load the tools menu
require('./menu/tools');

// load the data inspector tool
require('./inspector/entry');

// // load the offcanvas menu control
// require('./map/controls/offCanvasMenu');

// load the offcanvas settings control
// require('./menu/settings');
$('#dataDiv').data('stormTracksVisibility', true);

// load the station marker menu item
require('./station-markers/stationMarkerMenu');

// load the radar message listener
require('./radar-message/radar_message');

// load the historical hurricanes module
require('../hurricanes/historical/menuItem');

// // add the help control
// require('./map/controls/help/helpControl');

// add the menu control
//require('./map/controls/offCanvasMenu');

$('#atcDlg').on('click', function(e) {
    var clickedTarget = $(e.target).attr('id');
    if (clickedTarget == 'atcDlg' || clickedTarget == 'atcDlgClose') {
        $(this).hide();
    }
})

// $('#dataDiv').data('currentStation', 'KLWX');

// $('#haClearMap').on('mouseenter', function() {
//     ut.animateBrightness(100, 80, 100, $('#haClearMapOuter'));
// })
// $('#haClearMap').on('mouseleave', function() {
//     ut.animateBrightness(80, 100, 100, $('#haClearMapOuter'));
// })

// $('#haDatePicker').datepicker({
//     format: "yyyy",
//     viewMode: "years", 
//     minViewMode: "years",
//     autoclose: true,
//     startDate: new Date(new Date().setFullYear(1851)),
//     endDate: new Date(new Date().setFullYear(2021))
// })

// var haStormNameDropdown = new bootstrap.Dropdown($('#haStormNameDropdown'));
// haStormNameDropdown.show();

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

    $('.mapFooter').css('justify-content', 'space-evenly');
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
// $('#productsDropdownTrigger').on('click', function(e) {
//     $('#productsDropdown').css('bottom', parseInt($('#map').css('bottom')) + 5);
//     var bsDropdownClass = new bootstrap.Dropdown($('#productsDropdown'));

//     if (!bsDropdownClass._isShown()) {
//         bsDropdownClass.show();
//         document.body.addEventListener('click', function(e) {
//             // if the click target is the map
//             if ($(e.target).prop("tagName") == 'CANVAS') {
//                 bsDropdownClass.hide();
//             }
//         });
//     } else {
//         bsDropdownClass.hide();
//     }
// })

// $('#wsr88dMenu').show();
// $('#tdwrMenu').hide();

// $(".productOption").on('click', function() {
//     document.getElementById('productsDropdownTriggerText').innerHTML = this.innerHTML;
//     //$('.selectedProduct').removeClass('selectedProduct');
//     //$(this).addClass('selectedProduct')
//     var thisInnerHTML = $(this).html();
//     $('.selectedProductMenuItem').remove();
//     $(this).html(`<i class="fa-solid fa-circle-check icon-green selectedProductMenuItem">&nbsp;&nbsp;</i>${thisInnerHTML}`);

//     var thisValue = $(this).attr('value');
//     $('#productsDropdownTriggerText').html(window.longProductNames[thisValue]);

//     ut.disableModeBtn();
//     ut.progressBarVal('set', 0);
//     if ($('#dataDiv').data('curProd') != thisValue) {
//         tilts.resetTilts();
//         tilts.listTilts(ut.numOfTiltsObj[thisValue]);
//     }
//     $('#dataDiv').data('curProd', thisValue);
//     var clickedProduct = ut.tiltObject[$('#dataDiv').data('curTilt')][thisValue];
//     var currentStation = $('#stationInp').val();
//     loaders.getLatestFile(currentStation, [3, clickedProduct, 0], function(url) {
//         console.log(url);
//         loaders.loadFileObject(ut.phpProxy + url + '#', 3);
//     })
// })

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

// function addRadarGeojson() {
//     map.addSource('earthquakes', {
//         type: 'geojson',
//         // Use a URL for the value for the `data` property.
//         data: '../data/KTLX_V06_20130520_201643.geojson#'
//     });

//     map.addLayer({
//         'id': 'earthquakes-layer',
//         'type': 'line',
//         'source': 'earthquakes',
//         'paint': {
//             'line-color': 'rgb(255, 0, 0)',
//             'line-width': 1
//         }
//     });

//     var isShown = true;
//     $(document).keyup(function(event) {
//         if (event.which === 13) {
//             if (isShown) {
//                 isShown = false;
//                 map.moveLayer('earthquakes-layer');
//                 map.setLayoutProperty('earthquakes-layer', 'visibility', 'none');
//             } else {
//                 isShown = true;
//                 map.moveLayer('earthquakes-layer');
//                 map.setLayoutProperty('earthquakes-layer', 'visibility', 'visible');
//             }
//         }
//     });
// }

// ../data/RODN20220831_075245_V06
// ../data/KCRP20170825_235733_V06
// ../data/KLIX20050829_061516.gz
// ../data/KTLX20130520_201643_V06.gz
// ../data/KAMA20190506_021539_V06
// ../data/KMLB19920824_134828.gz
// ../data/level3/MHX_N0B_2022_08_02_01_57_08
// ../data/level3/KOUN_SDUS54_N0QTLX_201305202016
// ../data/level3/KOUN_SDUS54_N0UTLX_201305202016

function doWhenLoad(func) {
    setTimeout(function() {
        if (map.loaded()) {
            func();
        } else {
            map.on('load', function() {
                func();
            })
        }
    }, 0)
}
// doWhenLoad(function() {
//     const NEXRADLevel2File = require('./libnexrad/level2/level2_parser');
//     const Level2Factory = require('./libnexrad/level2/level2_factory');

//     const NEXRADLevel3File = require('./libnexrad/level3/level3_parser');
//     const Level3Factory = require('./libnexrad/level3/level3_factory');

//     const loaders_nexrad = require('./libnexrad/loaders_nexrad');

//     // // ../data/KTLX20130520_201643_V06.gz#
//     // // ../data/level3/SHV_NMD_2023_04_03_02_29_56# (from Unidata AWS bucket)
//     // // ../data/level3/DTX_NTV_2023_04_05_17_40_06# (from https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/)
//     // // ../data/level3/DTX_NHI_2023_04_05_18_05_14# (from https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/)
//     // TLX_NST_2023_04_19_21_55_59
//     // TLX_TVS_2023_04_19_21_55_59
//     // TLX_NMD_2023_04_19_21_55_59
//     loaders_nexrad.file_to_buffer('../data/level3/TLX_TVS_2023_04_19_21_55_59#', function(buffer) {
//         const file = new NEXRADLevel3File(buffer);
//         const L3Factory = new Level3Factory(file);
//         console.log(L3Factory);
//         L3Factory.plot();
//     })
// })

// function doWhenLoad() {
//     (function loadFileIndex(i, max) {
//         console.log(i)
//         loaders.getLatestFile('KAKQ', [3, 'N0B', i], function(url) {
//             //console.log(`${i}: ${url}`);
//             loaders.loadFileObject(ut.phpProxy + url + '#', 3);
//             if (i < max) { loadFileIndex(i + 1, max) }
//         })
//     })(0, 2)
// }

// setTimeout(function() {
//     if (map.loaded()) { doWhenLoad() }
//     else { doWhenLoad() }
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