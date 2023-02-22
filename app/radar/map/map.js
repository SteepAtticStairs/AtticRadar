mapboxgl.accessToken = 'pk.eyJ1Ijoic3RlZXBhdHRpY3N0YWlycyIsImEiOiJjbDNvaGFod2EwbXluM2pwZTJiMDYzYjh5In0.J_HeH00ry0tbLmGmTy4z5w';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 3,
    center: [-98.5606744, 36.8281576],
    maxZoom: 20,
    preserveDrawingBuffer: true,
    // bearingSnap: 360,
    maxPitch: 0,

    attributionControl: false,
    //renderWorldCopies: false,
    //maxPitch: 75,
    //zoom: 6,
    //center: [-66.0190363102349, 18.15295560177013],
    //projection: 'equirectangular',
    //fadeDuration: 0,
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

// map.on('click', (e) => {
//     const popup = new mapboxgl.Popup({ className: 'alertPopup' })
//         .setLngLat(e.lngLat)
//         .setHTML("Hello World!")
//         .addTo(map);
// })

// $('#dataDiv').data('centerMarker', []);
// map.on('move', function() {
//     var mapCenter = map.getCenter();

//     var oldMark = $('#dataDiv').data('centerMarker');
//     for (var i in oldMark) {
//         oldMark[i].remove();
//     }
//     var mark = new mapboxgl.Marker()
//     .setLngLat([mapCenter.lng, mapCenter.lat])
//     .addTo(map);
//     oldMark.push(mark)
//     $('#dataDiv').data('centerMarker', oldMark);
// })

// map.on('style.load', () => {
//     map.setFog({
//         // // color: 'rgb(186, 210, 235)', // Lower atmosphere
//         // 'high-color': 'rgb(242, 214, 136)', // Upper atmosphere
//         // 'horizon-blend': 0.5, // Atmosphere thickness (default 0.2 at low zooms)
//         // 'space-color': 'rgb(116, 164, 214)', // Background color
//         // //'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
//         'space-color': ["interpolate",["linear"],["zoom"],0.8,"#87ceeb",1,"white"]
//     });
// });
// // map.on('style.load', () => {
// //     map.addLayer({
// //         "id": "sky",
// //         "type": "sky",
// //         "layout": {}
// //     })
// // })

// https://github.com/mapbox/mapbox-gl-js/issues/3265#issuecomment-660400481
setTimeout(() => map.resize(), 0);
window.onresize = () => { map.resize() }
window.onclick = () => { map.resize() }

// const getMouseColor = require('../misc/colorPicker');
// map.on("mousemove", e => getMouseColor(e, map));

// map.on('click', function(e) {
//     console.log(e.lngLat)
//     console.log(map.getZoom())
// })

map.on('zoomstart', function() {
    if ($('#dataDiv').data('stationMarkersVisible') || $('#dataDiv').data('metarsActive')) {
        map._fadeDuration = 0;
    } else {
        map._fadeDuration = 300;
    }
})

// // https://github.com/mapbox/mapbox-gl-js/issues/3039#issuecomment-401964567
// function registerControlPosition(map, positionName) {
//     if (map._controlPositions[positionName]) {
//         return;
//     }
//     var positionContainer = document.createElement('div');
//     positionContainer.className = `mapboxgl-ctrl-${positionName}`;
//     map._controlContainer.appendChild(positionContainer);
//     map._controlPositions[positionName] = positionContainer;
// }
// registerControlPosition(map, 'top-center');
// registerControlPosition(map, 'bottom-center');
// registerControlPosition(map, 'center');

document.getElementById("texturecolorbar").width = 0;
document.getElementById("texturecolorbar").height = 0;

// // enable bootstrap tooltips
// const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
// const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

// function showOptionsBox() {
//     //$('#optionsBox').show("slide", { direction: "down" }, 200);
//     $('#optionsBox').animate({height: 200}, 200);
//     document.getElementById('mainInfo').style.display = 'block';
//     document.getElementById('smallInfo').style.display = 'none';
// }
// function hideOptionsBox() {
//     //$('#optionsBox').hide("slide", { direction: "down" }, 200);
//     //$('#optionsBox').animate({height: 'auto'}, 200);
//     document.getElementById('smallInfo').style.display = 'block';
//     document.getElementById('mainInfo').style.display = 'none';
//     $('#optionsBox').animate({height: $('#smallInfo').height() + 12}, 200);
// }

// document.getElementById('mainInfo').style.display = 'none';
// document.getElementById('smallInfo').style.display = 'block';
// $('#dataDiv').data('optionsBoxShown', false);
// $('#optionsBox').animate({height: $('#smallInfo').height() + 12}, 0);

// $('#optionsBox').on('click', function(e) {
//     // if the user clicks on the dropdown button
//     if ($(e.target).parents().eq(0).attr('id') == 'tiltsDropdown') return;
//     // if the user clicks on one of the dropdown menu items
//     if ($(e.target).parents().eq(1).attr('id') == 'tiltsMenu') return;
//     // if the user clicks on one of the product buttons
//     if ($(e.target).parents().eq(1).attr('id') == 'mainInfo' && $('#armrModeBtnSlideDown').find('.armrIcon').hasClass('fa-clock')) return;
//     // if the user clicks on one of the elevation buttons in upload mode
//     if ($(e.target).parents().eq(0).attr('id') == 'l2ElevBtns') return;
//     // if the user clicks on the product dropdown in upload mode
//     if ($(e.target).attr('id') == 'l2ProductBtn') return;
//     // if the user clicks on the product dropdown options in upload mode
//     if ($(e.target).parents().eq(1).attr('id') == 'l2ProductMenu') return;
//     // if the user clicks on the switch to toggle elevation display mode
//     if ($(e.target).attr('id') == 'elevOptionsSwitch') return;
//     // if the user clicks on one of the elevation navigation buttons in upload mode
//     if ($(e.target).parents().eq(0).attr('id') == 'elevNavBtns') return;

//     if ($('#dataDiv').data('optionsBoxShown')) {
//         $('#dataDiv').data('optionsBoxShown', false);
//         hideOptionsBox();
//     } else if (!$('#dataDiv').data('optionsBoxShown')) {
//         $('#dataDiv').data('optionsBoxShown', true);
//         showOptionsBox();
//     }
// })
// function mouseEnter(thisObj) {
//     $(thisObj).animate({
//         backgroundColor: 'rgb(212, 212, 212)',
//     }, 150);
// }
// function mouseLeave(thisObj) {
//     $(thisObj).animate({
//         backgroundColor: 'white',
//     }, 150);
// }

// $('#optionsBox').on('mouseenter', function(e) {
//     mouseEnter(this);
// })
// $('#optionsBox').on('mouseleave', function(e) {
//     mouseLeave(this);
// })
// $('.productBtnGroup').on('mouseenter', function(e) {
//     mouseLeave($('#optionsBox'));
// })
// $('.productBtnGroup').on('mouseleave', function(e) {
//     mouseEnter($('#optionsBox'));
// })

//$('#optionsBox').hide();
// $('.optionsBoxControl').trigger('click');

module.exports = map;