const style_url = 'https://tiles.openfreemap.org/styles/dark';
window.attic_data.style_url = style_url;
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