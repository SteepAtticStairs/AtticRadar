const ut = require('../../../utils');
const createOffCanvasItem = require('../../../menu/createOffCanvasItem');

$.get('app/radar/map/controls/help/helpControlContent.html', function(data) {
    createOffCanvasItem({
        'id': 'helpMenuItem',
        'class': 'alert alert-secondary offCanvasMenuItem',
        'contents': 'Help',
        'icon': 'fa fa-question',
        'css': ''
    }, function(thisObj, innerDiv, iconElem) {
        ut.spawnModal({
            'title': 'Help',
            'headerColor': 'alert-info',
            'body': data
        })
    })
})