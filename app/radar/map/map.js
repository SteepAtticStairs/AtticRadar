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

document.getElementById("texturecolorbar").width = 0;
document.getElementById("texturecolorbar").height = 0;

// enable bootstrap tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

function showOptionsBox() {
    //$('#optionsBox').show("slide", { direction: "down" }, 200);
    $('#optionsBox').animate({height: 200}, 200);
    document.getElementById('mainInfo').style.display = 'block';
    document.getElementById('smallInfo').style.display = 'none';
}
function hideOptionsBox() {
    //$('#optionsBox').hide("slide", { direction: "down" }, 200);
    //$('#optionsBox').animate({height: 'auto'}, 200);
    document.getElementById('smallInfo').style.display = 'block';
    document.getElementById('mainInfo').style.display = 'none';
    $('#optionsBox').animate({height: $('#smallInfo').height() + 12}, 200);
}

document.getElementById('mainInfo').style.display = 'none';
document.getElementById('smallInfo').style.display = 'block';
$('#dataDiv').data('optionsBoxShown', false);
$('#optionsBox').animate({height: $('#smallInfo').height() + 12}, 0);

$('#optionsBox').on('click', function(e) {
    // if the user clicks on the dropdown button
    if ($(e.target).parents().eq(0).attr('id') == 'tiltsDropdown') return;
    // if the user clicks on one of the dropdown menu items
    if ($(e.target).parents().eq(1).attr('id') == 'tiltsMenu') return;
    // if the user clicks on one of the product buttons
    if ($(e.target).parents().eq(1).attr('id') == 'mainInfo') return;

    if ($('#dataDiv').data('optionsBoxShown')) {
        $('#dataDiv').data('optionsBoxShown', false);
        hideOptionsBox();
    } else if (!$('#dataDiv').data('optionsBoxShown')) {
        $('#dataDiv').data('optionsBoxShown', true);
        showOptionsBox();
    }
})
function mouseEnter(thisObj) {
    $(thisObj).animate({
        backgroundColor: 'rgb(212, 212, 212)',
    }, 150);
}
function mouseLeave(thisObj) {
    $(thisObj).animate({
        backgroundColor: 'white',
    }, 150);
}

$('#optionsBox').on('mouseenter', function(e) {
    mouseEnter(this);
})
$('#optionsBox').on('mouseleave', function(e) {
    mouseLeave(this);
})
// $('.productBtnGroup').on('mouseenter', function(e) {
//     mouseLeave($('#optionsBox'));
// })
// $('.productBtnGroup').on('mouseleave', function(e) {
//     mouseEnter($('#optionsBox'));
// })

//$('#optionsBox').hide();
$('.optionsBoxControl').trigger('click');

module.exports = map;

// load some controls
require('./controls/testFileControls');