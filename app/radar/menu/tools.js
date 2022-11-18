//var map = require('../map/map');
const createMenuOption = require('./createMenuOption');
const createToolsOption = require('./createToolsOption');
const ut = require('../utils');

var tooltipElem = $('#toolsMenuTooltip');
tooltipElem.hide();

// const tooltip = bootstrap.Tooltip.getInstance('#tooltipDiv');
// tooltip.enable();

function nodeToString(node) {
    var tmpNode = document.createElement('div');
    tmpNode.appendChild(node.cloneNode(true));
    var str = tmpNode.innerHTML;
    tmpNode = node = null; // prevent memory leaks in IE
    return str;
}

function addAllToolsItems() {
    var n = 0;
    require('../distance/menuItem').distanceToolsOption(n = n + 1);
    require('../menu/settings').settingsOption(n = n + 1);
    require('../map/controls/reload').reloadOption(n = n + 1);
}

function updateTooltipPosition(divElem) {
    // https://stackoverflow.com/a/3632650/18758797
    tooltipElem.show().position({
        my: 'center',
        at: 'center',
        of: $(divElem)
    }).offset({ top: 0 });
    var bottom = $(window).height() - tooltipElem.offset().top - tooltipElem.height();
    tooltipElem.offset({ top: bottom - parseInt($('#map').css('bottom')) - 20 });
}

// https://stackoverflow.com/a/15191130/18758797
$.fn.animateRotate = function (angle, duration, easing, complete) {
    var args = $.speed(duration, easing, complete);
    var step = args.step;
    return this.each(function (i, e) {
        args.complete = $.proxy(args.complete, e);
        args.step = function (now) {
            $.style(e, 'transform', 'rotate(' + now + 'deg)');
            if (step) return step.apply(e, arguments);
        };

        $({ deg: 0 }).animate({ deg: angle }, args);
    });
};

function flipIcon(icon, minimizeOrMaximize) {
    function rotateThing(deg) {
        $(icon).animateRotate(deg, {
            duration: 400,
            easing: 'swing',
            complete: function () {},
            step: function () {}
        });
    }
    if (minimizeOrMaximize == 'minimize') {
        $(icon).removeClass('fa-circle-chevron-right');
        $(icon).addClass('fa-circle-chevron-up');
        rotateThing(450);
    } else if (minimizeOrMaximize == 'maximize') {
        $(icon).removeClass('fa-circle-chevron-up');
        $(icon).addClass('fa-circle-chevron-right');
        rotateThing(-450);
    }
}

addAllToolsItems();
createMenuOption({
    'divId': 'toolsItemDiv',
    'iconId': 'toolsItemClass',

    'divClass': 'mapFooterMenuItem',
    'iconClass': 'icon-grey',

    'contents': 'Tools',
    'icon': 'fa fa-circle-chevron-right',
    'css': ''
}, function(divElem, iconElem) {
    if (!$(iconElem).hasClass('icon-blue')) {
        $(iconElem).addClass('icon-blue');
        $(iconElem).removeClass('icon-grey');

        flipIcon(iconElem, 'maximize');
        updateTooltipPosition(divElem);
    } else if ($(iconElem).hasClass('icon-blue')) {
        $(iconElem).removeClass('icon-blue');
        $(iconElem).addClass('icon-grey');

        flipIcon(iconElem, 'minimize');
        tooltipElem.hide();
    }
})