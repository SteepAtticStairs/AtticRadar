const loaders = require('../loaders');
const isDevelopmentMode = require('../misc/urlParser');
const createControl = require('./createControl');
var map = require('./map');

if (isDevelopmentMode) {
    createControl({
        'id': 'testFileThing',
        'position': 'top-right',
        'icon': 'fa-flask-vial',
        'css': 'margin-top: 100%;'
    }, function() {
        if (!$('#testFileThing').hasClass('icon-selected')) {
            $('#testFileThing').addClass('icon-selected');
            $('#testFileThing').removeClass('icon-black');
            // KLIX20050829_061516.gz
            // KTLX20130520_200356_V06.gz
            // KTLX20130520_201643_V06.gz
            // KMHX20180914_050219_V06
            var fileToLoad = 'KTLX20130520_201643_V06.gz';
            loaders.loadFileObject('data/' + fileToLoad, fileToLoad, 2);
        } else if ($('#testFileThing').hasClass('icon-selected')) {
            $('#testFileThing').removeClass('icon-selected');
            $('#testFileThing').addClass('icon-black');
        }
    })

    createControl({
        'id': 'testFile3Thing',
        'position': 'top-right',
        'icon': 'fa-3',
        'css': 'margin-top: 100%;'
    }, function() {
        if (!$('#testFile3Thing').hasClass('icon-selected')) {
            $('#testFile3Thing').addClass('icon-selected');
            $('#testFile3Thing').removeClass('icon-black');
            // LWX_N0H_2022_04_18_15_21_24
            // LWX_N0Q_2022_04_18_15_21_24
            // KOUN_SDUS54_N0STLX_201305200301
            // KCRP_SDUS54_N0UCRP_201708252357
            // KCRP_SDUS54_N0QCRP_201708252357
            // KOUN_SDUS54_DVLTLX_201305200301
            // KOUN_SDUS34_NSTTLX_201305200301

            // LOT_NMD_2021_06_21_04_22_17
            // LOT_NMD_2021_06_21_04_27_31
            // KILX_NTV
            // ILX_N0Q_2021_07_15_22_19_15

            // Level3_NKX_N0B_20220808_0100.nids

            var fileToLoad = 'KCRP_SDUS54_N0UCRP_201708252357';
            loaders.loadFileObject('data/level3/' + fileToLoad, fileToLoad, 3);
        } else if ($('#testFile3Thing').hasClass('icon-selected')) {
            $('#testFile3Thing').removeClass('icon-selected');
            $('#testFile3Thing').addClass('icon-black');
        }
    })
}