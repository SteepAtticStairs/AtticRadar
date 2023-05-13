function createMenuOption(options, clickFunc) {
    var divId = options.divId;
    var iconId = options.iconId;

    var divClass = options.divClass;
    var iconClass = options.iconClass;

    var location = options.location;
    var size = options.size;

    var contents = options.contents;
    var icon = options.icon;
    var css = options.css;

    var div = document.createElement('div');
    div.id = divId;
    div.className = divClass;
    //$(div).addClass('mapFooterMenuItem');

    const defaultSize = 23;

    var iconElem = document.createElement('span');
    $(iconElem).css("fontSize", defaultSize)
    if (size != undefined) { $(iconElem).css("fontSize", size) }
    iconElem.id = iconId;
    $(iconElem).addClass(icon);
    $(iconElem).addClass(iconClass);
    //iconElem.innerHTML = '&nbsp;&nbsp;'
    div.appendChild(iconElem);

    var nbspElem = document.createElement('span');
    nbspElem.className = 'noselect';
    nbspElem.appendChild(document.createTextNode('\u00A0\u00A0\u00A0'));

    if (location == 'bottom-center' || location == undefined) {
        document.getElementById('mapFooter').appendChild(div);
        document.getElementById('mapFooter').appendChild(nbspElem);
    } else if (location == 'top-left') {
        document.getElementById('top-left').appendChild(div);
        document.getElementById('top-left').appendChild(nbspElem);
    }

    // var outerDiv = document.createElement('div');
    // outerDiv.id = `${divId}_outer`;

    // var div = document.createElement('div');
    // div.id = divId;
    // div.className = divClass;
    // outerDiv.appendChild(div);

    // var iconElem = document.createElement('span');
    // iconElem.id = `${divId}_icon`;
    // iconElem.className = icon;
    // iconElem.innerHTML = '&nbsp;&nbsp;'
    // div.appendChild(iconElem);

    // var innerDiv = document.createElement('span');
    // innerDiv.id = `${divId}_inner`;
    // innerDiv.innerHTML = contents;
    // div.appendChild(innerDiv);

    // div.style.cssText = css;

    $(iconElem).on('click', function() {
        clickFunc(div, iconElem);
    })

    // function animateBrightness(startVal, stopVal, duration) {
    //     // https://stackoverflow.com/a/20082518/18758797
    //     $({blurRadius: startVal}).animate({blurRadius: stopVal}, {
    //         duration: duration,
    //         easing: 'linear',
    //         step: function() {
    //             $(div).css({
    //                 "-webkit-filter": "brightness("+this.blurRadius+"%)",
    //                 "filter": "brightness("+this.blurRadius+"%)"
    //             });
    //         }
    //     });
    // }
    // $(iconElem).on('mouseenter', function() {
    //     $(iconElem).animate({
    //         color: 'rgb(200, 200, 200)',
    //     }, 150);
    // })
    // $(iconElem).on('mouseleave', function() {
    //     $(iconElem).animate({
    //         color: 'rgb(0, 0, 0)',
    //     }, 150);
    // })

    // outerDiv.appendChild(document.createElement('br'));
    // document.getElementById('offCanvasBody').appendChild(outerDiv);
}

module.exports = createMenuOption;