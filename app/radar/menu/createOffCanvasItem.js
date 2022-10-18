const ut = require('../utils');

function createOffCanvasItem(options, clickFunc, hoverFuncs) {
    var divId = options.id;
    var divClass = options.class;
    var contents = options.contents;
    var icon = options.icon;
    var css = options.css;
    var provideOwnHoverFunctions = false;
    if (options.provideOwnHoverFunctions) {
        provideOwnHoverFunctions = true;
    }

    var outerDiv = document.createElement('div');
    outerDiv.id = `${divId}_outer`;

    var div = document.createElement('div');
    div.id = divId;
    div.className = divClass;
    outerDiv.appendChild(div);

    var iconElem = document.createElement('span');
    iconElem.id = `${divId}_icon`;
    iconElem.className = icon;
    iconElem.innerHTML = '&nbsp;&nbsp;'
    div.appendChild(iconElem);

    var innerDiv = document.createElement('span');
    innerDiv.id = `${divId}_inner`;
    innerDiv.innerHTML = contents;
    div.appendChild(innerDiv);

    div.style.cssText = css;

    $(div).on('click', function() {
        clickFunc(this, innerDiv, iconElem);
    })

    $(div).on('mouseenter', function() {
        if (!provideOwnHoverFunctions) {
            ut.animateBrightness(100, 80, 100, div);
        } else {
            hoverFuncs('mouseenter', div)
        }
    })
    $(div).on('mouseleave', function() {
        if (!provideOwnHoverFunctions) {
            ut.animateBrightness(80, 100, 100, div);
        } else {
            hoverFuncs('mouseleave', div)
        }
    })

    outerDiv.appendChild(document.createElement('br'));
    document.getElementById('offCanvasBody').appendChild(outerDiv);
}

module.exports = createOffCanvasItem;