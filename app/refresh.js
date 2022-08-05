const loaders = require('./loaders');
const ut = require('./utils');
const mapFuncs = require('./map/mapFunctions');
var map = require('./map/map');

function refreshCurrentRadar() {
    var curPro = document.getElementById('currentRadarProduct').innerHTML;
    console.log('LOADING LATEST FILE')
    loaders.getLatestL3File($('#stationInp').val().slice(1), curPro, function(data) {
        console.log(data);
        mapFuncs.removeMapLayer('baseReflectivity');
        loaders.loadFileObject(ut.phpProxy + data, 'sn.last', 3);
    })
}

class refreshControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.innerHTML = `
            <div class="mapboxgl-control-container" style="margin-top: 100%;">
                <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                    <button class="mapboxgl-ctrl-fullscreen" type="button" aria-label="Globe Toggle">
                        <span class="fa fa-arrow-rotate-right icon-black" id="refreshThing" aria-hidden="true" title="Globe Toggle"></span>
                    </button>
                </div>
            </div>`
        this._container.addEventListener('click', function () {
            if (!$('#refreshThing').hasClass('icon-selected')) {
                //$('#refreshThing').addClass('icon-selected');
                //$('#refreshThing').removeClass('icon-black');
                refreshCurrentRadar();
            } else if ($('#refreshThing').hasClass('icon-selected')) {
                $('#refreshThing').removeClass('icon-selected');
                $('#refreshThing').addClass('icon-black');
            }
        })
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
var theRefreshControl = new refreshControl;
map.addControl(theRefreshControl, 'top-right');

module.exports = {
    refreshCurrentRadar
}