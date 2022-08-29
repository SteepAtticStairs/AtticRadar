function createMenuOption(options, clickFunc) {
    var divId = options.id;
    var divClass = options.class;
    var contents = options.contents;
    var css = options.css;

    var div = document.createElement('div');
    div.id = divId;
    div.className = divClass;
    div.innerHTML = contents;
    div.style.cssText = css;

    $(div).on('click', function() {
        clickFunc(this);
    })

    document.getElementById('offCanvasBody').appendChild(div);
    document.getElementById('offCanvasBody').appendChild(document.createElement('br'));
}

module.exports = createMenuOption;