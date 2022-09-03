function createMenuOption(options, clickFunc) {
    var divId = options.id;
    var divClass = options.class;
    var contents = options.contents;
    var icon = options.icon;
    var css = options.css;

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

    function animateBrightness(startVal, stopVal, duration) {
        // https://stackoverflow.com/a/20082518/18758797
        $({blurRadius: startVal}).animate({blurRadius: stopVal}, {
            duration: duration,
            easing: 'linear',
            step: function() {
                $(div).css({
                    "-webkit-filter": "brightness("+this.blurRadius+"%)",
                    "filter": "brightness("+this.blurRadius+"%)"
                });
            }
        });
    }
    $(div).on('mouseenter', function() {
        animateBrightness(100, 80, 100);
    })
    $(div).on('mouseleave', function() {
        animateBrightness(80, 100, 100);
    })

    outerDiv.appendChild(document.createElement('br'));
    document.getElementById('offCanvasBody').appendChild(outerDiv);
}

module.exports = createMenuOption;