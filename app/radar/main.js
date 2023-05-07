var map = require('./map/map');
const ut = require('./utils');

// initialize the "atticData" global variable,
// which will store data that can be accessed globally
window.atticData = {};

// add file upload MENU listeners
require('./upload/upload_menu');

// load the mode control
require('./menu/mode');

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

// load the station marker menu item
require('./station-markers/stationMarkerMenu');

// load the radar message listener
require('./radar-message/radar_message');

// // load the historical hurricanes module
// require('../hurricanes/historical/menuItem');

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

// $('#armrUploadFileBtn').click();

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