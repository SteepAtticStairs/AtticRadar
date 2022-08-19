const { plot } = require('../../../nexrad-level-2-plot/src');
const loaders = require('../loaders');
const mapFuncs = require('../map/mapFunctions');

function loadL2Listeners(l2rad) {
    var btnsArr = [
        "level2-ref",
        "level2-vel",
        "level2-rho",
        "level2-phi",
        "level2-zdr",
        "level2-sw "
    ]
    for (key in btnsArr) {
        var curElemIter = document.getElementById(btnsArr[key]);
        curElemIter.disabled = false;
    }

    $('.l2BtnGroup button').on('click', function () {
        if (this.value == 'level2-ref') {
            const level2Plot = plot(l2rad, 'REF', {
                elevations: 1,
            });
        } else if (this.value == 'level2-vel') {
            const level2Plot = plot(l2rad, 'VEL', {
                elevations: 2,
            });
        } else if (this.value == 'level2-rho') {
            const level2Plot = plot(l2rad, 'RHO', {
                elevations: 1,
            });
        } else if (this.value == 'level2-phi') {
            const level2Plot = plot(l2rad, 'PHI', {
                elevations: 1,
            });
        } else if (this.value == 'level2-zdr') {
            const level2Plot = plot(l2rad, 'ZDR', {
                elevations: 1,
            });
        } else if (this.value == 'level2-sw ') {
            const level2Plot = plot(l2rad, 'SW ', {
                elevations: 7,
            });
        }
    });
}

module.exports = loadL2Listeners;