const { plot } = require('../../nexrad-level-2-plot/src');
const loaders = require('../loaders');
const mapFuncs = require('../map/mapFunctions');

function loadL2Listeners(l2rad, displayElevations) {
    var phpProxy = 'https://php-cors-proxy.herokuapp.com/?';
    //$('.reflPlotButton').trigger('click');
    //console.log('initial reflectivity plot');
    //displayElevations('REF');
    var btnsArr = [
        "l2-ref",
        "l2-vel",
        "l2-rho",
        "l2-phi",
        "l2-zdr",
        "l2-sw "
    ]
    for (key in btnsArr) {
        var curElemIter = document.getElementById(btnsArr[key]);
        curElemIter.disabled = false;
        $(curElemIter).addClass('btn-outline-primary');
        $(curElemIter).removeClass('btn-outline-secondary');
    }
    document.getElementById('loadl2').style.display = 'none';
    $('.level2btns button').off();
    console.log('turned off listener')
    $('.level2btns button').on('click', function () {
        console.log(this.value)
        mapFuncs.removeMapLayer('baseReflectivity');
        if (this.value == 'load') {
            loaders.getLatestFile($('#stationInp').val(), function (fileName, y, m, d, s) {
                var individualFileURL = `https://noaa-nexrad-level2.s3.amazonaws.com/${y}/${m}/${d}/${s}/${fileName}`
                console.log(phpProxy + individualFileURL)
                loaders.loadFileObject(phpProxy + individualFileURL, 'balls', 2, 'REF');
            });
        }
        if (this.value == 'l2-ref') {
            const level2Plot = plot(l2rad, 'REF', {
                elevations: 1,
            });
        } else if (this.value == 'l2-vel') {
            const level2Plot = plot(l2rad, 'VEL', {
                elevations: 2,
            });
        } else if (this.value == 'l2-rho') {
            const level2Plot = plot(l2rad, 'RHO', {
                elevations: 1,
            });
        } else if (this.value == 'l2-phi') {
            const level2Plot = plot(l2rad, 'PHI', {
                elevations: 1,
            });
        } else if (this.value == 'l2-zdr') {
            const level2Plot = plot(l2rad, 'ZDR', {
                elevations: 1,
            });
        } else if (this.value == 'l2-sw ') {
            displayElevations('SW ');
            const level2Plot = plot(l2rad, 'SW ', {
                elevations: parseInt($('#elevInput').val()),
            });
        }
    });
    console.log('turned on listener i think')
}

module.exports = loadL2Listeners;