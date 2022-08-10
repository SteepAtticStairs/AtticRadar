var map = require('./map/map');
const ut = require('./utils');
const loaders = require('./loaders');

const { Level2Radar } = require('../nexrad-level-2-data/src');
const { plot } = require('../nexrad-level-2-plot/src');

const l3parse = require('../nexrad-level-3-data/src');
const l3plot = require('./level3/draw');

$('.productBtnGroup button').on('click', function() {
    //console.log(this.value)
    loaders.getLatestFile('KMHX', 2, function(url) {
        console.log(url);
        loaders.loadFileObject(ut.phpProxy + url, 2);
    })
})

document.addEventListener('loadFile', function(event) {
    var uploadedFile = event.detail[0];
    var fileLevel = event.detail[1];
    var wholeOrPart = event.detail[2];
    const reader = new FileReader();

    reader.addEventListener("load", function () {
        if (fileLevel == 2 || fileLevel == 22) {
            var l2rad = new Level2Radar(ut.toBuffer(this.result));
            console.log(l2rad);
            plot(l2rad, 'REF', {
                elevations: 1,
            });
        } else if (fileLevel == 3) {
            var l3rad = l3parse(ut.toBuffer(this.result));
            console.log(l3rad);
            l3plot(l3rad);
        }
    }, false);
    reader.readAsArrayBuffer(uploadedFile);
})