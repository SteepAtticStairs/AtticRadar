var map = require('../core/map/map');
const ut = require('../core/utils');

ut.setMapMargin('bottom', $('#mapFooter').height());
ut.setMapMargin('top', $('#radarHeader').height());

if (require('../core/misc/detect_mobile_browser')) {
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

// function roundArrayElements(array) {
//     const roundedArray = [];
//     for (let i = 0; i < array.length; i++) {
//         if (Array.isArray(array[i])) {
//             roundedArray.push(roundArrayElements(array[i])); // Recursively handle nested arrays
//         } else {
//             // Round the current element to three decimal places
//             const roundedValue = parseFloat(array[i].toFixed(3));
//             roundedArray.push(roundedValue);
//         }
//     }
//     return roundedArray;
// }

// for (var i in forecast_zones) {
//     forecast_zones[i].geometry.coordinates = roundArrayElements(forecast_zones[i].geometry.coordinates);
// }
// console.log(forecast_zones);

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