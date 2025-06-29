const style_url = 'https://tiles.openfreemap.org/styles/dark';
const map = new maplibregl.Map({
    container: 'map',
    style: style_url,
    zoom: 3,
    center: [-97.3302, 38.5667],
    maxZoom: 20,
    preserveDrawingBuffer: true,
    maxPitch: 0,

    fadeDuration: 0,

    attributionControl: true,
    projection: 'mercator',
});

/**
 * Changes a couple things about the map style.
 * Only works on OpenFreeMap's "dark" style.
 */
const now = Date.now();
fetch(style_url, {
    cache: 'no-store',
})
.then(response => response.json())
.then(style_json => {
    try {
        const uppercase_layers = [];
        for (var i = 0; i < style_json.layers.length; i++) {
            // if the layer text is uppercase, store it for later
            if (style_json.layers[i]?.layout?.['text-transform'] == 'uppercase') {
                uppercase_layers.push(style_json.layers[i]);
            }
        }

        // we want these layers to remain uppercase (country names)
        const whitelist_layers = ['place_country_major', 'place_country_minor', 'place_country_other']
        for (var x = 0; x < uppercase_layers.length; x++) {
            const layer_id = uppercase_layers[x].id;
            if (!whitelist_layers.includes(layer_id)) {
                // if it's not whitelisted then remove the forced uppercase
                map.setLayoutProperty(layer_id, 'text-transform', 'none');
            } else {
                // if it is whitelisted (e.g. remaining uppercase), brigten the text color a bit
                map.setPaintProperty(layer_id, 'text-color', 'rgb(200, 200, 200)');
            }
        }

        console.log(`Updated map style in ${Date.now() - now} ms`);
    } catch (error) {
        // just in case openfreemap changes their style json and breaks this very specific code
        console.error(error);
    }
})

// can't find any other way to collapse the attribution by default
$('.maplibregl-ctrl-attrib-button').click();

// MOBILE - disable map rotation using touch rotation gesture
map.touchZoomRotate.disableRotation();
// DESKTOP - disable map rotation using right click + drag
map.dragRotate.disable();
// DESKTOP - disable map rotation using the keyboard
map.keyboard.disableRotation();
// prevent the context menu from opening when right clicking on the map
$('#map').on('contextmenu', function(e) {
    if ($(e.target).hasClass('maplibregl-canvas')) {
        e.preventDefault();
    }
})

// https://github.com/mapbox/mapbox-gl-js/issues/3265#issuecomment-660400481
setTimeout(() => map.resize(), 0);
window.onresize = () => { map.resize() }
window.onclick = () => { map.resize() }

module.exports = map;