/*
* This file is the entry point for the project - everything starts here.
*/

function load() {
    // initialize the "atticData" global variable,
    // which will store data that can be accessed globally
    window.atticData = {};

    // load the weather station menu item
    require('../../weather_station/menu_item');

    // load the radio menu item
    require('../../radio/menu_item');

    // initialize the alerts
    require('../../alerts/menu_item');
    // load alertd on entry
    $('#alertMenuItemIcon').click();

    // initialize the METARs module
    require('../../metars/entry');

    // add file upload MENU listeners
    require('../../radar/upload/upload_menu');

    // load the atticRadarMenu helper file
    require('../menu/atticRadarMenu');

    // load the productSelectionMenu helper file
    require('../menu/productSelectionMenu');

    // load the settings menu
    require('../menu/settings');

    // load the data inspector tool
    require('../../radar/inspector/entry');

    // load the station marker menu item
    require('../../radar/station_markers/station_marker_menu');

    // load the radar message listener
    require('../../radar/radar_message/radar_message');

    // load the surface fronts module
    require('../../surface_fronts/menu_item');

    // load the hurricanes module
    require('../../hurricanes/menu_item');

    // load the SPC module
    require('../../spc/menu_item');

    // load the tide stations module
    require('../../tides/menu_item');

    // load the about menu
    require('../about/about_screen');

    // detect if AtticRadar is being loaded in an iframe
    require('../misc/detect_iframe');

    // document.addEventListener('keyup', event => {
    //     if (event.code === 'Space') {
    //         const image_url = map.getCanvas().toDataURL();
    //         var image = new Image();
    //         image.src = image_url;
    //         var w = window.open('');
    //         w.document.write(image.outerHTML);
    //     }
    // })

    // $('#settingsItemClass').click();
    // $('#armrSPCOutlooksBtn').click();
    // $('#armrHurricanesBtnSwitchElem').click();
    // $('#alertMenuItemIcon').click();
    // $('#armrSPC_convective-hail-day1_BtnSwitchElem').click();
//     $('#armrTideStationsBtnSwitchElem').click();

//     const get_individual_data = require('../../tides/get_individual_data');
//     const show_chart = require('../../tides/show_chart');
//     const display_attic_dialog = require('../menu/attic_dialog');
//     display_attic_dialog({
//         'title': 'Tide Station',

//         'body':
// `<div id="tide_chart_container">
//     <div class="tide_chart_container_text">Loading...</div>
// </div>\
// <div id="tide_station_footer">\
// <div id="tide_stations_datepicker_container"><div id="tide_stations_datepicker"></div></div>\
// <div id="tide_height_text"></div>\
// </div>`,

//         'color': 'rgb(120, 120, 120)',
//         'textColor': 'black',
//     })
//     const id = '8656590'
//     const name = 'Atlantic Beach Triple S Pier';
//     const today = new Date();
//     get_individual_data(id, name, today, (tide_height_array, station_name) => {
//         show_chart(tide_height_array, station_name, id, today);
//     })

    // const NEXRADLevel2File = require('../../radar/libnexrad/level2/level2_parser');
    // const Level2Factory = require('../../radar/libnexrad/level2/level2_factory');

    // const NEXRADLevel3File = require('../../radar/libnexrad/level3/level3_parser');
    // const Level3Factory = require('../../radar/libnexrad/level3/level3_factory');

    // const loaders_nexrad = require('../../radar/libnexrad/loaders_nexrad');

    // // // ../data/KTLX20130520_201643_V06.gz#
    // // // ../data/level3/SHV_NMD_2023_04_03_02_29_56# (from Unidata AWS bucket)
    // // // ../data/level3/DTX_NTV_2023_04_05_17_40_06# (from https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/)
    // // // ../data/level3/DTX_NHI_2023_04_05_18_05_14# (from https://tgftp.nws.noaa.gov/SL.us008001/DF.of/DC.radar/)
    // // TLX_NST_2023_04_19_21_55_59
    // // TLX_TVS_2023_04_19_21_55_59
    // // TLX_NMD_2023_04_19_21_55_59
    // // EWR_TV0_2023_08_13_05_42_06
    // loaders_nexrad.file_to_buffer('../../../data/level3/EWR_TV0_2023_08_13_05_42_06#', function (buffer) {
    //     const file = new NEXRADLevel3File(buffer);
    //     const L3Factory = new Level3Factory(file);
    //     console.log(L3Factory);
    //     L3Factory.plot();
    // })
}

function _load_map() {
    const map = require('../map/map');
    if (map.loaded()) {
        load();
    } else {
        map.on('load', function() {
            load();
        })
    }
}

if (document.readyState == 'complete' || document.readyState == 'interactive') {
    _load_map();
} else if (document.readyState == 'loading') {
    window.onload = function () {
        _load_map();
    }
}