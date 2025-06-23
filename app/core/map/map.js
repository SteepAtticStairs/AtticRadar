mapboxgl.accessToken = 'pk.eyJ1IjoidHdhbGtlcjkyIiwiYSI6ImNtYnN0cWx2ajA1cTAycnEycWJwMG4zZ3MifQ.jlFBO6utDzfwyEHzRiwoOQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    zoom: 3,
    center: [-97.3302, 38.5667],
    maxZoom: 20,
    preserveDrawingBuffer: true,
    maxPitch: 0,

    fadeDuration: 0,

    attributionControl: false,
    projection: 'mercator',
});

// MOBILE - disable map rotation using touch rotation gesture
map.touchZoomRotate.disableRotation();
// DESKTOP - disable map rotation using right click + drag
map.dragRotate.disable();
// DESKTOP - disable map rotation using the keyboard
map.keyboard.disableRotation();
// prevent the context menu from opening when right clicking on the map
$('#map').on('contextmenu', function(e) {
    if ($(e.target).hasClass('mapboxgl-canvas')) {
        e.preventDefault();
    }
})

// https://github.com/mapbox/mapbox-gl-js/issues/3265#issuecomment-660400481
setTimeout(() => map.resize(), 0);
window.onresize = () => { map.resize() }
window.onclick = () => { map.resize() }

module.exports = map;