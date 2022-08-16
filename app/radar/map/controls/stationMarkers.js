var map = require('../map');
const loaders = require('../../loaders');
const ut = require('../../utils');
const createControl = require('./createControl');
const tilts = require('../../menu/tilts');

var statMarkerArr = [];
function showStations() {
    $.getJSON('https://steepatticstairs.github.io/weather/json/radarStations.json', function (data) {
        var allKeys = Object.keys(data);
        for (key in allKeys) {
            var curIter = data[allKeys[key]];
            var curStat = allKeys[key];

            // check if it is an unsupported radar
            if (curStat.charAt(0) == 'K') {
                // create a HTML element for each feature
                var el = document.createElement('div');
                el.className = 'customMarker';
                el.innerHTML = curStat;

                // make a marker for each feature and add to the map
                var mark = new mapboxgl.Marker(el)
                    .setLngLat([curIter[2], curIter[1]])
                    .addTo(map);
                statMarkerArr.push(mark)
            }
        }
    }).then(function () {
        $('.customMarker').on('click', function () {
            //$('.productBtnGroup button').off()
            // var btnsArr = [
            //     "l2-ref",
            //     "l2-vel",
            //     "l2-rho",
            //     "l2-phi",
            //     "l2-zdr",
            //     "l2-sw "
            // ]
            // for (key in btnsArr) {
            //     var curElemIter = document.getElementById(btnsArr[key]);
            //     curElemIter.disabled = true;
            //     $(curElemIter).addClass('btn-outline-secondary');
            //     $(curElemIter).removeClass('btn-outline-primary');
            // }
            // document.getElementById('loadl2').style.display = 'block';

            // $('#stationInp').val(this.innerHTML)

            // $('#srResBtn').trigger('click');
            // //document.getElementById('curRadProd').innerHTML = $('#srResBtn').html();

            // document.getElementById('curProd').innerHTML = 'ref';
            // loaders.loadLatestFile(
            //     'l3',
            //     'ref',
            //     $('#tiltDropdownBtn').attr('value'),
            //     $('#stationInp').val().toLowerCase()
            // );
            $('#stationInp').val(this.innerHTML);

            tilts.resetTilts();
            tilts.listTilts(ut.numOfTiltsObj['ref']);

            $('#dataDiv').data('curProd', 'ref');

            ut.progressBarVal('set', 0);

            loaders.getLatestFile(this.innerHTML, [3, 'N0B', 0], function(url) {
                console.log(url);
                loaders.loadFileObject(ut.phpProxy + url, 3);
            })
        })
    })
}

createControl({
    'id': 'stationThing',
    'position': 'top-left',
    'icon': 'fa-satellite-dish',
    'css': 'margin-top: 100%;'
}, function() {
    if (!$('#stationThing').hasClass('icon-selected')) {
        $('#stationThing').addClass('icon-selected');
        $('#stationThing').removeClass('icon-black');
        showStations();
    } else if ($('#stationThing').hasClass('icon-selected')) {
        $('#stationThing').removeClass('icon-selected');
        $('#stationThing').addClass('icon-black');
        for (key in statMarkerArr) {
            statMarkerArr[key].remove();
        }
    }
})

window.addEventListener('load', (event) => {
    setTimeout(function() {
        $('#stationThing').addClass('icon-selected');
        $('#stationThing').removeClass('icon-black');
        showStations();
    }, 200)
})