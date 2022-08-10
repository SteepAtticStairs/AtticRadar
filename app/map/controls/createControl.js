var map = require('../map');

function createControl(options, clickFunc) {
    var divId = options.id;
    var divClass = options.class;
    var position = options.position;
    var icon = options.icon;
    var css = options.css;

    class control {
        onAdd(map) {
            this._map = map;
            this._container = document.createElement('div');
            // margin-top: 100%;
            this._container.innerHTML = `
                <div class="mapboxgl-control-container" style="${css}">
                    <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                        <button class="mapboxgl-ctrl-fullscreen" type="button" aria-label="Button">
                            <span class="fa ${icon} icon-black" id="${divId}" aria-hidden="true" title="Button"></span>
                        </button>
                    </div>
                </div>`
            $(this._container).addClass(divClass);
            this._container.addEventListener('click', function () {
                clickFunc();
            })
            return this._container;
        }

        onRemove() {
            this._container.parentNode.removeChild(this._container);
            this._map = undefined;
        }
    }
    var theControl = new control;
    map.addControl(theControl, position);
}

module.exports = createControl;