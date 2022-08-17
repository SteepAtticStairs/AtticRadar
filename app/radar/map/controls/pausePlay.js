const loaders = require('../../loaders');
const ut = require('../../utils');
const createControl = require('./createControl');
var map = require('../map');

createControl({
    'id': 'pausePlayThing',
    'class': 'pausePlayBtn',
    'position': 'top-right',
    'icon': 'fa-play',
    'css': 'margin-top: 100%;'
}, function() {
    if ($('#pausePlayThing').hasClass('fa-play')) {
        $('#pausePlayThing').removeClass('fa-play');
        $('#pausePlayThing').removeClass('icon-green');

        $('#pausePlayThing').addClass('fa-pause');
        $('#pausePlayThing').addClass('icon-red');

        ut.progressBarVal('show');
        ut.progressBarVal('set', 0);
        var thisStation = $('#stationInp').val();
        function loadLayerIter(i, totalFrames) {
            var layerName = `radarLayer${i}`
            loaders.getLatestFile(thisStation, [3, 'N0B', i], function(url) {
                //console.log(url);
                loaders.loadFileObject(ut.phpProxy + url, 3, layerName);

                if (i < totalFrames) {
                    i = i + 1;
                    loadLayerIter(i, totalFrames);
                } else {
                    var timer = setInterval(myFunction, 500);
                    function myFunction() {
                        if (ut.radarLayersDiv('get').length == totalFrames + 1) {
                            clearInterval(timer);
                            ut.progressBarVal('hide');
                            setAnimLoop();
                            return;
                        }
                    }
                }
            })
        }
        if (ut.radarLayersDiv('get').includes('init')) {
            ut.radarLayersDiv('set', []);
            loadLayerIter(0, ut.numOfFrames);
        } else {
            ut.progressBarVal('hide');
            setAnimLoop();
        }

        function setAnimLoop() {
            var arr = ut.radarLayersDiv('get');
            arr.sort();
            arr.reverse();
            //console.log(arr)

            var i = 0;
            function myLoop() {
                var radarLoopTimeout = setTimeout(function() {
                    for (key in arr) {
                        if (map.getLayer('init')) {
                            map.setLayoutProperty('init', 'visibility', 'none');
                        }
                        map.setLayoutProperty(arr[key], 'visibility', 'none');
                    }
                    $('#dataDiv').data('curFrame', arr[i]);
                    map.setLayoutProperty(arr[i], 'visibility', 'visible');
                    i++;
                    if (!$('#pausePlayThing').hasClass('fa-play')) {
                        if (i < arr.length) {
                            myLoop();
                        } else if (i == arr.length) {
                            i = 0;
                            myLoop();
                        }
                    } else {
                        clearTimeout(radarLoopTimeout)
                    }
                }, ut.loopSpeed)
            }
            myLoop();
        }
    } else if (!$('#pausePlayThing').hasClass('fa-play')) {
        $('#pausePlayThing').removeClass('fa-pause');
        $('#pausePlayThing').removeClass('icon-red');

        $('#pausePlayThing').addClass('fa-play');
        $('#pausePlayThing').addClass('icon-green');
    }
})
$('#pausePlayThing').removeClass('icon-black');
$('#pausePlayThing').addClass('icon-green');