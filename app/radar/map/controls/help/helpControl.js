const ut = require('../../../utils');
const createControl = require('../createControl');

$.get('app/radar/map/controls/help/helpControlContent.html', function(data) {
    createControl({
        'id': 'helpThing',
        'position': 'bottom-left',
        'icon': 'fa-question',
        'css': 'margin-top: 100%;'
    }, function() {
        ut.spawnModal({
            'title': 'Help',
            'headerColor': 'alert-info',
            'body': data
        })
    })
})