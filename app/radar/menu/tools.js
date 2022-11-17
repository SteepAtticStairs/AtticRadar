//var map = require('../map/map');
const createMenuOption = require('./createMenuOption');
const ut = require('../utils');

const tooltip = bootstrap.Tooltip.getInstance('#tooltipDiv');
tooltip.enable();

function nodeToString(node) {
    var tmpNode = document.createElement('div');
    tmpNode.appendChild(node.cloneNode(true));
    var str = tmpNode.innerHTML;
    tmpNode = node = null; // prevent memory leaks in IE
    return str;
}

function createToolsOption(options, tooltip, cb) {
    var menuItem = createMenuOption(options, function(divElem, iconElem) {});

    var content;
    if (tooltip._newContent != null) {
        var previousContent = tooltip._newContent['.tooltip-inner'];
        var parsedDocument = new DOMParser().parseFromString(previousContent, 'text/html');
        content = parsedDocument.querySelector('.tooltipContent');
        // var length = content.getElementsByTagName('*').length;
        // if (length != 0) {
        //     content.innerHTML += `${nodeToString(menuItem[0])}${nodeToString(menuItem[1])}`;
        // }
        content.innerHTML += `${nodeToString(menuItem[1])}${nodeToString(menuItem[0])}`;
    } else {
        content = `<div class='tooltipContent'>${nodeToString(menuItem[0])}</div>`;
    }

    tooltip.setContent({ '.tooltip-inner': content })
    // tooltip.show();

    cb(menuItem[2], menuItem[3])
}

function addAllToolsItems() {
    tooltip.show();

    createToolsOption({
        'divId': 'distanceItemDiv',
        'iconId': 'distanceItemClass',

        'divClass': 'mapFooterMenuItem',
        'iconClass': 'icon-grey',

        'returnHTML': true,

        'contents': 'Distance Measurement Tool',
        'icon': 'fa fa-ruler',
        'css': ''
    }, tooltip, function(divElemId, iconElemId) {
        $(`#${iconElemId}`).on('click', function() {
        if (!$(`#${iconElemId}`).hasClass('icon-blue')) {
            $(`#${iconElemId}`).addClass('icon-blue');
            $(`#${iconElemId}`).removeClass('icon-grey');
        } else if ($(`#${iconElemId}`).hasClass('icon-blue')) {
            $(`#${iconElemId}`).removeClass('icon-blue');
            $(`#${iconElemId}`).addClass('icon-grey');
        }
        })
    })
}

createMenuOption({
    'divId': 'toolsItemDiv',
    'iconId': 'toolsItemClass',

    'divClass': 'mapFooterMenuItem',
    'iconClass': 'icon-grey',

    'contents': 'Tools',
    'icon': 'fa fa-wrench',
    'css': ''
}, function(divElem, iconElem) {

    if (!$(iconElem).hasClass('icon-blue')) {
        $(iconElem).addClass('icon-blue');
        $(iconElem).removeClass('icon-grey');

        // https://stackoverflow.com/a/3632650/18758797
        $('#tooltipDiv').position({
            my: 'center',
            at: 'center',
            of: $(divElem)
        });

        addAllToolsItems();
    } else if ($(iconElem).hasClass('icon-blue')) {
        $(iconElem).removeClass('icon-blue');
        $(iconElem).addClass('icon-grey');

        tooltip.hide();
    }
})