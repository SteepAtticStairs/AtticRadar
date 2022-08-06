const isDevelopmentMode = require('../misc/urlParser');

mapboxgl.accessToken = 'pk.eyJ1Ijoic3RlZXBhdHRpY3N0YWlycyIsImEiOiJjbDNvaGFod2EwbXluM2pwZTJiMDYzYjh5In0.J_HeH00ry0tbLmGmTy4z5w';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 3,
    center: [-98.5606744, 36.8281576],
    //projection: 'equirectangular',
});

// https://github.com/mapbox/mapbox-gl-js/issues/3039#issuecomment-401964567
function registerControlPosition(map, positionName) {
    if (map._controlPositions[positionName]) {
        return;
    }
    var positionContainer = document.createElement('div');
    positionContainer.className = `mapboxgl-ctrl-${positionName}`;
    map._controlContainer.appendChild(positionContainer);
    map._controlPositions[positionName] = positionContainer;
}
registerControlPosition(map, 'top-center');
registerControlPosition(map, 'bottom-center');
registerControlPosition(map, 'center');

class infoControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.innerHTML = `
            <div id='infoContainer' style='
            display: none;
            text-align: center;
            width: auto;
            height: auto;
            padding: 5px 10px;
            /* line-height: 25px; */
            background-color: white;
            border: 1px solid black;
            border-radius: 5px;
            '>
                <input id="fileInput" type="file"/>
                <div id='radarInfoDiv' style='display: none'>
                    <div id='radFileNameParent'><b><a id='radFileName'></a></b></div>
                    <div id='radDateParent'><b>Date: </b><a id='radDate'></a></div>
                    <b>Station: </b><a id='radStation'></a>
                    <b>VCP: </b><a id='radVCP'></a>
                </div>
            </div>`
        this._container.addEventListener('click', function () {
            //console.log('sus')
        })
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
var theInfoControl = new infoControl
map.addControl(theInfoControl, 'top-center');

class infoControlBottom {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.innerHTML = `
            <div id='infoContainerBottom' style='
            text-align: center;
            width: auto;
            height: auto;
            padding: 5px 10px;
            /* line-height: 25px; */
            background-color: white;
            border: 1px solid black;
            border-radius: 5px;
            display: none;
            '>
                <input id="radarFileInput" type="file"/>
            </div>`
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
var theInfoControlBottom = new infoControlBottom
map.addControl(theInfoControlBottom, 'top-center');

document.getElementById("texturecolorbar").width = 0;
document.getElementById("texturecolorbar").height = 0;

// enable bootstrap tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

function showPlotBtn() {
    class reflPlotControl {
        onAdd(map) {
            this._map = map;
            this._container = document.createElement('div');
            this._container.innerHTML = `
                <div class="mapboxgl-control-container" style="margin-top: 100%;">
                    <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                        <button class="mapboxgl-ctrl-fullscreen" type="button" aria-label="Globe Toggle">
                            <span class="fa fa-hurricane icon-black" id="reflPlotThing" aria-hidden="true" title="Globe Toggle"></span>
                        </button>
                    </div>
                </div>`
            $(this._container).addClass('reflPlotButton');
            this._container.addEventListener('click', function () {
                if (!$('#reflPlotThing').hasClass('icon-selected')) {
                    $('#reflPlotThing').addClass('icon-selected');
                    $('#reflPlotThing').removeClass('icon-black');
                } else if ($('#reflPlotThing').hasClass('icon-selected')) {
                    $('#reflPlotThing').removeClass('icon-selected');
                    $('#reflPlotThing').addClass('icon-black');
                    removeMapLayer('baseReflectivity');
                }
            })
            return this._container;
        }

        onRemove() {
            this._container.parentNode.removeChild(this._container);
            this._map = undefined;
        }
    }
    var theReflPlotControl = new reflPlotControl;
    map.addControl(theReflPlotControl, 'top-left');
}
//showPlotBtn();

class settingsControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.innerHTML = `
            <div class="mapboxgl-control-container" style="margin-top: 100%;">
                <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                    <button class="mapboxgl-ctrl-fullscreen" type="button" aria-label="Globe Toggle">
                        <span class="fa fa-gear icon-black" id="settingsThing" aria-hidden="true" title="Globe Toggle"></span>
                    </button>
                </div>
            </div>`
        this._container.addEventListener('click', function () {
            if (!$('#settingsThing').hasClass('icon-selected')) {
                $('#settingsThing').addClass('icon-selected');
                $('#settingsThing').removeClass('icon-black');
                $("#settingsDialog").dialog({
                    modal: true,
                    // https://stackoverflow.com/a/30624445/18758797
                    open: function () {
                        $(this).parent().css({
                            position: 'absolute',
                            top: 10,
                            maxHeight: '70vh',
                            overflow: 'scroll'
                        });
                        $('.ui-widget-overlay').bind('click', function () {
                            $("#settingsDialog").dialog('close');
                        });
                    },
                    close: function () {
                        $('#settingsThing').removeClass('icon-selected');
                        $('#settingsThing').addClass('icon-black');
                    }
                });
            } else if ($('#settingsThing').hasClass('icon-selected')) {
                $('#settingsThing').removeClass('icon-selected');
                $('#settingsThing').addClass('icon-black');
            }
        })
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
var theSettingsControl = new settingsControl;
//map.addControl(theSettingsControl, 'top-right');

class testFileControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.innerHTML = `
            <div class="mapboxgl-control-container" style="margin-top: 100%;">
                <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                    <button class="mapboxgl-ctrl-fullscreen" type="button" aria-label="Globe Toggle">
                        <span class="fa fa-flask-vial icon-black" id="testFileThing" aria-hidden="true" title="Globe Toggle"></span>
                    </button>
                </div>
            </div>`
        this._container.addEventListener('click', function () {
            if (!$('#testFileThing').hasClass('icon-selected')) {
                $('#testFileThing').addClass('icon-selected');
                $('#testFileThing').removeClass('icon-black');
                // KLIX20050829_061516.gz
                // KTLX20130520_200356_V06.gz
                var fileToLoad = 'KTLX20130520_200356_V06.gz';
                loadFileObject('data/' + fileToLoad, fileToLoad, 2);
            } else if ($('#testFileThing').hasClass('icon-selected')) {
                $('#testFileThing').removeClass('icon-selected');
                $('#testFileThing').addClass('icon-black');
            }
        })
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
var theTestFileControl = new testFileControl;

class testFile3Control {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.innerHTML = `
            <div class="mapboxgl-control-container" style="margin-top: 100%;">
                <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                    <button class="mapboxgl-ctrl-fullscreen" type="button" aria-label="Globe Toggle">
                        <span class="fa fa-3 icon-black" id="testFile3Thing" aria-hidden="true" title="Globe Toggle"></span>
                    </button>
                </div>
            </div>`
        this._container.addEventListener('click', function () {
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

                var fileToLoad = 'KILX_NTV';
                loadFileObject('data/level3/' + fileToLoad, fileToLoad, 3);
            } else if ($('#testFile3Thing').hasClass('icon-selected')) {
                $('#testFile3Thing').removeClass('icon-selected');
                $('#testFile3Thing').addClass('icon-black');
            }
        })
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
var theTestFile3Control = new testFile3Control;

if (isDevelopmentMode) {
    map.addControl(theTestFile3Control, 'top-right');
    map.addControl(theTestFileControl, 'top-right');
    document.getElementById('infoContainerBottom').style.display = 'block';
}

class curFileControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.innerHTML = `
                    <div class="mapboxgl-control-container" style="margin-top: 100%;">
                        <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                            <button class="mapboxgl-ctrl-fullscreen" type="button" aria-label="Globe Toggle">
                                <span class="fa fa-clock icon-black" id="curFileThing" aria-hidden="true" title="Globe Toggle"></span>
                            </button>
                        </div>
                    </div>`
        this._container.classList.add('currentFileControl');
        this._container.addEventListener('click', function () {
            if (!$('#curFileThing').hasClass('icon-selected')) {
                $('#curFileThing').addClass('icon-selected');
                $('#curFileThing').removeClass('icon-black');
                if ($('#levelInput').val() == 'l2') {
                    loadLatestFile('l2');
                } else if ($('#levelInput').val() == 'l3') {
                    loadLatestFile('l3');
                }
            } else if ($('#curFileThing').hasClass('icon-selected')) {
                $('#curFileThing').removeClass('icon-selected');
                $('#curFileThing').addClass('icon-black');
            }
        })
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
var theCurFileControl = new curFileControl;
//map.addControl(theCurFileControl, 'top-right');

class showOptionsBoxControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.innerHTML = `
                    <div class="mapboxgl-control-container" style='position: absolute; bottom: 10vh'>
                        <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                            <button class="mapboxgl-ctrl-fullscreen" type="button" aria-label="Globe Toggle">
                                <span class="fa fa-circle-chevron-up icon-black" id="showOptionsBoxThing" aria-hidden="true"></span>
                            </button>
                        </div>
                    </div>`
        this._container.classList.add('optionsBoxControl');
        this._container.addEventListener('click', function () {
            if (!$('#showOptionsBoxThing').hasClass('icon-selected')) {
                $('#showOptionsBoxThing').addClass('icon-selected');

                $('#showOptionsBoxThing').removeClass('fa-circle-chevron-up');
                $('#showOptionsBoxThing').addClass('fa-circle-chevron-down');

                $('#showOptionsBoxThing').removeClass('icon-black');
                $('#optionsBox').show("slide", { direction: "down" }, 200);
            } else if ($('#showOptionsBoxThing').hasClass('icon-selected')) {
                $('#showOptionsBoxThing').removeClass('icon-selected');

                $('#showOptionsBoxThing').removeClass('fa-circle-chevron-down');
                $('#showOptionsBoxThing').addClass('fa-circle-chevron-up');

                $('#showOptionsBoxThing').addClass('icon-black');
                $('#optionsBox').hide("slide", { direction: "down" }, 200);
            }
        })
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
var theShowOptionsBoxControl = new showOptionsBoxControl;
map.addControl(theShowOptionsBoxControl, 'bottom-left');

//$('#optionsBox').hide();
$('.optionsBoxControl').trigger('click');

// radius of wsr-88d scan in km
var radius = 460;
$('#fileStation').on('DOMSubtreeModified', function () {
    var station = document.getElementById('fileStation').innerHTML;
    $.getJSON('https://steepatticstairs.github.io/weather/json/radarStations.json', function (data) {
        var stationLat = data[station][1];
        var stationLng = data[station][2];
        //map.flyTo({
        //    center: [stationLng, stationLat],
        //    zoom: 8,
        //    duration: 1000,
        //});
        var stationBbox = getBoundingBox(stationLat, stationLng, radius);

        var coord1 = stationBbox.minLat;
        var coord2 = stationBbox.minLng;
        var coord3 = stationBbox.maxLat;
        var coord4 = stationBbox.maxLng;
        //map.addLayer({
        //    id: 'canvas-layer',
        //    type: 'raster',
        //    source: {
        //        type: 'canvas',
        //        canvas: 'theCanvas',
        //        coordinates: [
        //            [coord2, coord3],
        //            [coord4, coord3],
        //            [coord4, coord1],
        //            [coord2, coord1]
        //        ],
        //    }
        //});
        //new mapboxgl.Marker()
        //    .setLngLat([stationLng, stationLat])
        //    .addTo(map);
    });
});

module.exports = map;