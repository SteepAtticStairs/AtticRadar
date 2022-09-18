var map = require('../map');

var hasVisibilityControl = false;
class visibilityControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.innerHTML = `
            <div class="mapboxgl-control-container" style="margin-top: 100%;">
                <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                    <button class="mapboxgl-ctrl-fullscreen" type="button" aria-label="Globe Toggle">
                        <span class="fa fa-eye icon-black" id="visibilityThing" aria-hidden="true" title="Globe Toggle"></span>
                    </button>
                </div>
            </div>`
        this._container.addEventListener('click', function () {
            if (!$('#visibilityThing').hasClass('icon-selected')) {
                $('#visibilityThing').addClass('icon-selected');

                $('#visibilityThing').removeClass('fa-eye');
                $('#visibilityThing').addClass('fa-eye-slash');

                $('#visibilityThing').removeClass('icon-black');

                map.setLayoutProperty('baseReflectivity', 'visibility', 'none');
                var stLayers = $('#dataDiv').data('stormTrackMapLayers')
                for (var item in stLayers) {
                    map.setLayoutProperty(stLayers[item], 'visibility', 'none');
                }
            } else if ($('#visibilityThing').hasClass('icon-selected')) {
                $('#visibilityThing').removeClass('icon-selected');

                $('#visibilityThing').removeClass('fa-eye-slash');
                $('#visibilityThing').addClass('fa-eye');

                $('#visibilityThing').addClass('icon-black');

                map.setLayoutProperty('baseReflectivity', 'visibility', 'visible');
                var stLayers = $('#dataDiv').data('stormTrackMapLayers')
                for (var item in stLayers) {
                    map.setLayoutProperty(stLayers[item], 'visibility', 'visible');
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
var theVisibilityControl = new visibilityControl;
if (!hasVisibilityControl) {
    map.addControl(theVisibilityControl, 'top-right');
    hasVisibilityControl = true;
}
//map.addControl(theVisibilityControl, 'top-left');