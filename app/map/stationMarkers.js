var map = require('./map');
const loaders = require('../loaders');

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
                curElemIter.disabled = true;
                $(curElemIter).addClass('btn-outline-secondary');
                $(curElemIter).removeClass('btn-outline-primary');
            }
            document.getElementById('loadl2').style.display = 'block';

            $('#stationInp').val(this.innerHTML)

            $('#srResBtn').trigger('click');
            //document.getElementById('curRadProd').innerHTML = $('#srResBtn').html();

            document.getElementById('curProd').innerHTML = 'ref';
            loaders.loadLatestFile(
                'l3',
                'ref',
                $('#tiltDropdownBtn').attr('value'),
                $('#stationInp').val().toLowerCase()
            );
        })
    })
}

class stationControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.innerHTML = `
                    <div class="mapboxgl-control-container" style="margin-top: 100%;">
                        <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                            <button class="mapboxgl-ctrl-fullscreen" type="button" aria-label="Globe Toggle">
                                <span class="fa fa-satellite-dish icon-black" id="stationThing" aria-hidden="true"></span>
                            </button>
                        </div>
                    </div>`
        this._container.addEventListener('click', function () {
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
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
var theStationControl = new stationControl;
map.addControl(theStationControl, 'top-left');