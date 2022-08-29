function createMenuOption(options, clickFunc) {
    var divId = options.id;
    var divClass = options.class;
    var contents = options.contents;
    var css = options.css;

    document.getElementById('offCanvasBody').innerHTML += 
    `<div id="${divId}" class="${divClass}">${contents}</div>`

    document.getElementById(`${divId}`).style.cssText = css;

    $(`#${divId}`).on('click', function() {
        clickFunc(this);
    })
}

module.exports = createMenuOption;