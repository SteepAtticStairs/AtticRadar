var map = require('../map');
const loaders = require('../../loaders');
const ut = require('../../utils');
const createControl = require('./createControl');
const tilts = require('../../menu/tilts');
const getStationStatus = require('../../misc/getStationStatus');
const isMobile = require('../../misc/detectmobilebrowser');

const blueColor = 'rgb(0, 157, 255)';
const redColor = 'rgb(255, 78, 78)';

function stationStatusColor() {
    getStationStatus(function(data) {
        $('.customMarker').each(function() {
            if (data[this.innerHTML].status == 'down') {
                $(this).css('background-color', redColor);
            }
        })
    })
}

var statMarkerArr = [];
function showStations() {
    $.getJSON('https://steepatticstairs.github.io/NexradJS/resources/radarStations.json', function (data) {
        var allKeys = Object.keys(data);
        for (key in allKeys) {
            var curIter = data[allKeys[key]];
            var curStat = allKeys[key];
            // generate station abbreviation json
            // statObj[curStat.slice(1)] = curStat;

            // check if it is an unsupported radar
            if (curStat.length == 4 && curStat.charAt(0) != 'T') {
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
        $('#dataDiv').data('statMarkerArr', statMarkerArr);
    }).then(function () {
        stationStatusColor();

        $('.customMarker').each(function() {
            if (this.innerHTML == $('#dataDiv').data('blueStationMarker')) {
                $(this).css('background-color', blueColor);
            }
        })

        $('.customMarker').on('click', function () {
            if (!$('#dataDiv').data('noMoreClicks')) {
                if (!$('#dataDiv').data('isFileUpload') && $(this).css('background-color') != redColor) {
                    // remove all other blue
                    $('.customMarker').each(function() {
                        if ($(this).css('background-color') == blueColor) {
                            $(this).css('background-color', 'rgb(136, 136, 136)');
                        }
                    })
                    $('#dataDiv').data('blueStationMarker', this.innerHTML);
                    // change background to blue
                    $(this).css('background-color', blueColor);
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

                    ut.disableModeBtn();

                    loaders.getLatestFile(this.innerHTML, [3, 'N0B', 0], function(url) {
                        console.log(url);
                        loaders.loadFileObject(ut.phpProxy + url, 3);
                    })
                }
            }
        })

        function mouseEnter(thisObj) {
            if ($(thisObj).css('background-color') != blueColor && $(thisObj).css('background-color') != redColor) {
                $(thisObj).animate({
                    backgroundColor: 'rgb(200, 200, 200)',
                }, 150);
            }
        }
        function mouseLeave(thisObj) {
            if ($(thisObj).css('background-color') != blueColor && $(thisObj).css('background-color') != redColor) {
                $(thisObj).animate({
                    backgroundColor: 'rgb(136, 136, 136)',
                }, 150);
            }
        }
        if (!isMobile) {
            $('.customMarker').on('mouseenter', function () {
                mouseEnter(this)
            })
            $('.customMarker').on('mouseleave', function () {
                mouseLeave(this)
            })
        }
    })
}

// createControl({
//     'id': 'stationThing',
//     'class': 'stationBtn',
//     'position': 'top-left',
//     'icon': 'fa-satellite-dish',
//     'css': 'margin-top: 100%;'
// }, function() {
//     if (!$('#stationThing').hasClass('icon-selected')) {
//         $('#stationThing').addClass('icon-selected');
//         $('#stationThing').removeClass('icon-black');
//         showStations();
//     } else if ($('#stationThing').hasClass('icon-selected')) {
//         $('#stationThing').removeClass('icon-selected');
//         $('#stationThing').addClass('icon-black');
//         for (key in statMarkerArr) {
//             statMarkerArr[key].remove();
//         }
//     }
// })

// setTimeout(function() {
//     $('#stationThing').addClass('icon-selected');
//     $('#stationThing').removeClass('icon-black');
//     showStations();
// }, 200)

module.exports = showStations;