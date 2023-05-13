const ut = require('../../radar/utils');
const createMenuOption = require('./createMenuOption');

const showHideDuration = 250;
function showARMwindow() {
    $('#atticRadarMenu').fadeIn(showHideDuration);
    $('#atticRadarMenuContainer').hide().show('slide', { direction: 'down' }, showHideDuration);
}
function hideARMwindow() {
    $('#atticRadarMenu').fadeOut(showHideDuration);
    $('#atticRadarMenuContainer').hide('slide', { direction: 'down' }, showHideDuration, function() {
        $('#atticRadarMenu').hide();
    });
}

createMenuOption({
    'divId': 'offcanvasMenuItemDiv',
    'iconId': 'offcanvasMenuItemIcon',

    'divClass': 'mapFooterMenuItem',
    'iconClass': 'icon-grey',

    'location': 'top-left',
    'size': 30,

    'contents': 'Open Offcanvas Menu',
    'icon': 'fa fa-bars',
    'css': ''
}, function(divElem, iconElem) {
    showARMwindow();

    $('#atticRadarMenuSettingsScreen').hide();
    $('#atticRadarMenuMainScreen').show();
})

// provided by ChatGPT
$.fn.rotateArrow = function (degrees, easing, duration) {
    return this.each(function () {
        var el = $(this);
        var currentRotation = getRotationDegrees(el);
        var finalRotation = currentRotation + degrees;
        el.animate({
            deg: finalRotation
        }, {
            duration: duration,
            easing: easing,
            step: function (now) {
                el.css({
                    transform: "rotate(" + now + "deg)"
                });
            }
        });
    });
};
function getRotationDegrees(el) {
    var st = window.getComputedStyle(el[0], null);
    var tr = st.getPropertyValue("-webkit-transform") ||
        st.getPropertyValue("-moz-transform") ||
        st.getPropertyValue("-ms-transform") ||
        st.getPropertyValue("-o-transform") ||
        st.getPropertyValue("transform");
    if (tr == 'none') return 0;
    var values = tr.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    return (angle < 0 ? angle + 360 : angle);
}

$('#atticRadarMenu').on('click', function(e) {
    var clickedTarget = $(e.target).attr('id');
    if (clickedTarget == 'atticRadarMenu'/* || clickedTarget == 'atcDlgClose'*/) {
        hideARMwindow();
        //$(this).hide();
    }
})
$('.armsHeaderExitBtn').click(function() {
    hideARMwindow();
    //$('#atticRadarMenu').hide();
})

function slideDownToggle(armrElem, armrSlideDownElem) {
    const duration = 150;
    const easing = 'swing';
    var arrow = armrElem.find('.armrIconArrowRight');
    var toggleswitch = armrSlideDownElem.find('.toggleSwitchContainter');

    if (arrow.data('rotationStatus') == 'normal' || arrow.data('rotationStatus') == undefined) {
        armrElem.addClass('armrTop');
        if (toggleswitch.length) { toggleswitch.hide().fadeIn(duration / 1.5) }
        armrSlideDownElem.slideDown(duration);
        arrow.rotateArrow(90, easing, duration);
        arrow.data('rotationStatus', 'down');
    } else {
        if (toggleswitch.length) { toggleswitch.fadeOut(duration / 1.5) }
        armrSlideDownElem.slideUp(duration, function() {
            armrElem.removeClass('armrTop');
        });
        arrow.rotateArrow(-90, easing, duration);
        arrow.data('rotationStatus', 'normal');
    }
}

function toggleswitchFunctions(switchElem, onFunction, offFunction) {
    // you can't use .click() because it fires twice for some reason
    switchElem.on('click', function(e) {
        var checkbox = $(this); //.find('input');
        var isChecked = checkbox.is(':checked'); // true if the switch just turned on
        if (isChecked) { onFunction() }
        else { offFunction() }
    })
}

$('.armrSlideDown').hover(function() {
    $(this).css('background-color', 'rgb(60, 60, 60)');
    $(this).css('cursor', 'default');
})

const fadeDuration = 150;

var mainMenuScreen = $('#atticRadarMenuMainScreen');
var settingsScreen = $('#atticRadarMenuSettingsScreen');

$('#armrSettingsBtn').click(function() {
    mainMenuScreen.fadeOut(fadeDuration, function() {
        settingsScreen.fadeIn(fadeDuration);
    });
    // mainMenuScreen.css('position', 'absolute').hide('slide', { direction: 'left' }, 1000);
    // settingsScreen.show('slide', { direction: 'right' }, 1000);
    // mainMenuScreen.hide()
    // settingsScreen.show('slide', { direction: 'right' }, 1000, function() {
    //     setTimeout(function() {
    //         settingsScreen.fadeOut(200);
    //     }, 200)
    // });
    // mainMenuScreen.hide('slide', { direction: 'left' }, 1000, function() {
    //     settingsScreen.show('slide', { direction: 'right' }, 1000);
    // });
})
$('#armsSettingsBackBtn').click(function() {
    settingsScreen.fadeOut(fadeDuration, function() {
        mainMenuScreen.fadeIn(fadeDuration);
    });
})

module.exports = {
    slideDownToggle,
    toggleswitchFunctions,
    showARMwindow,
    hideARMwindow
}