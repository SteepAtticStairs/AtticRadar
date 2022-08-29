function createMenuOption(options, clickFunc) {
    var divId = options.id;
    var divClass = options.class;
    var contents = options.contents;
    var icon = options.icon;
    var css = options.css;

    var div = document.createElement('div');
    div.id = divId;
    div.className = divClass;

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

    document.getElementById('offCanvasBody').appendChild(div);
    document.getElementById('offCanvasBody').appendChild(document.createElement('br'));
}

module.exports = createMenuOption;